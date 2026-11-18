/**
 * 图片输入管线：校验 → 解码 → 裁切/降采样 → 可上传源
 * 与渲染层解耦，纯浏览器 API，不依赖 React。
 */

export type HoloErrorReason = 'type' | 'decode' | 'network' | 'cors' | 'tooLarge' | 'webgl' | 'empty';

export type HoloStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface HoloErrorInfo {
  reason: HoloErrorReason;
  message: string;
  detail?: unknown;
}

export class HoloImageError extends Error {
  reason: HoloErrorReason;
  detail?: unknown;

  constructor(reason: HoloErrorReason, message: string, detail?: unknown) {
    super(message);
    this.name = 'HoloImageError';
    this.reason = reason;
    this.detail = detail;
  }
}

export const SUPPORTED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml'];

export const DEFAULT_MAX_BYTES = 20 * 1024 * 1024;
export const DEFAULT_MAX_DIMENSION = 2048;

/** 前端魔数嗅探，避免只信任可伪造/为空的 MIME */
export function sniffImageType(bytes: Uint8Array): string | null {
  const b = bytes;
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (b.length >= 4 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return 'image/gif';
  if (
    b.length >= 12 &&
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  ) {
    return 'image/webp';
  }
  if (b.length >= 12) {
    const box = String.fromCharCode(b[4], b[5], b[6], b[7]);
    const brand = String.fromCharCode(b[8], b[9], b[10], b[11]);
    if (box === 'ftyp' && (brand === 'avif' || brand === 'avis')) return 'image/avif';
  }
  if (b.length >= 2 && b[0] === 0x42 && b[1] === 0x4d) return 'image/bmp';
  return null;
}

export interface ValidateOptions {
  maxBytes?: number;
  accept?: string[];
}

/** 拖拽投放的第一道关卡：大小 + 魔数 + MIME 双校验 */
export async function validateFile(file: File, options: ValidateOptions = {}): Promise<void> {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const accept = options.accept ?? SUPPORTED_MIME;

  if (!file || file.size === 0) {
    throw new HoloImageError('empty', '文件为空，无法读取');
  }
  if (file.size > maxBytes) {
    throw new HoloImageError('tooLarge', `文件超过 ${Math.round(maxBytes / 1024 / 1024)}MB 限制`, { size: file.size });
  }
  if (file.type && !accept.includes(file.type)) {
    throw new HoloImageError('type', `不支持的类型：${file.type || '未知'}`, { type: file.type });
  }

  let header: Uint8Array;
  try {
    header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  } catch (error) {
    throw new HoloImageError('decode', '无法读取文件内容', error);
  }

  const sniffed = sniffImageType(header);
  if (!sniffed) {
    throw new HoloImageError('type', '文件内容不是可识别的图片格式', { type: file.type });
  }
  if (!accept.includes(sniffed)) {
    throw new HoloImageError('type', `不支持的类型：${sniffed}`, { type: sniffed });
  }
}

const isSameOriginAsset = (src: string) => /^(blob:|data:)/.test(src);

const looksCrossOrigin = (src: string) => {
  if (isSameOriginAsset(src)) return false;
  try {
    return new URL(src, window.location.href).origin !== window.location.origin;
  } catch {
    return false;
  }
};

export interface DecodedImage {
  source: ImageBitmap;
  width: number;
  height: number;
  dispose: () => void;
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new HoloImageError('decode', '无法创建 2D 画布');
  return { canvas, ctx };
}

/** 等比缩放到最长边限制内 */
function drawFitted(
  source: CanvasImageSource,
  width: number,
  height: number,
  maxDimension: number,
  coverRatio?: number
) {
  let sx = 0;
  let sy = 0;
  let sw = width;
  let sh = height;

  if (coverRatio) {
    const current = width / height;
    if (current > coverRatio) {
      sw = height * coverRatio;
      sx = (width - sw) / 2;
    } else {
      sh = width / coverRatio;
      sy = (height - sh) / 2;
    }
  }

  const scale = Math.min(1, maxDimension / Math.max(sw, sh));
  const targetW = Math.max(1, Math.round(sw * scale));
  const targetH = Math.max(1, Math.round(sh * scale));
  const { canvas, ctx } = createCanvas(targetW, targetH);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, targetW, targetH);
  return canvas;
}

async function bitmapFromBlob(blob: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(blob, { imageOrientation: 'from-image' });
  } catch {
    // 部分实现不支持该 option（或对 SVG 直接失败）
    return await createImageBitmap(blob);
  }
}

async function bitmapFromElement(src: string): Promise<ImageBitmap> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    if (!isSameOriginAsset(src)) element.crossOrigin = 'anonymous';
    element.decoding = 'async';
    element.onload = () => resolve(element);
    element.onerror = () =>
      reject(
        new HoloImageError(
          looksCrossOrigin(src) ? 'cors' : 'decode',
          looksCrossOrigin(src) ? '该地址不允许跨域读取，请改用本地上传' : '图片解码失败',
          src
        )
      );
    element.src = src;
  });

  if (!image.naturalWidth || !image.naturalHeight) {
    throw new HoloImageError('decode', '图片尺寸为 0');
  }
  const canvas = drawFitted(image, image.naturalWidth, image.naturalHeight, DEFAULT_MAX_DIMENSION);
  return await createImageBitmap(canvas);
}

/**
 * 解码任意图片地址（http/blob/data URL），返回可上传给 WebGL 的位图。
 * 主路径走 fetch + createImageBitmap（解码在线程池，不阻塞主线程）；
 * 失败后退回 <img> 光栅化，覆盖 SVG / AVIF 边缘实现。
 */
export async function decodeSource(src: string, maxDimension = DEFAULT_MAX_DIMENSION): Promise<DecodedImage> {
  let bitmap: ImageBitmap;

  try {
    const response = await fetch(src, { mode: 'cors', credentials: 'same-origin' });
    if (!response.ok) {
      throw new HoloImageError('network', `图片请求失败（HTTP ${response.status}）`, { status: response.status });
    }
    const blob = await response.blob();
    bitmap = await bitmapFromBlob(blob);
  } catch (error) {
    if (error instanceof HoloImageError) throw error;
    bitmap = await bitmapFromElement(src);
  }

  if (!bitmap.width || !bitmap.height) {
    bitmap.close();
    throw new HoloImageError('decode', '图片尺寸为 0');
  }

  const needsShrink = Math.max(bitmap.width, bitmap.height) > maxDimension;
  if (needsShrink) {
    const canvas = drawFitted(bitmap, bitmap.width, bitmap.height, maxDimension);
    bitmap.close();
    const scaled = await createImageBitmap(canvas);
    return { source: scaled, width: scaled.width, height: scaled.height, dispose: () => scaled.close() };
  }

  const { width, height } = bitmap;
  return { source: bitmap, width, height, dispose: () => bitmap.close() };
}

export interface PreparedImage {
  url: string;
  width: number;
  height: number;
  bytes: number;
  type: string;
  dispose: () => void;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new HoloImageError('decode', '图片编码失败'))),
      type,
      quality
    );
  });
}

export interface PrepareOptions {
  maxDimension?: number;
  maxBytes?: number;
  /** 传入后按 cover 语义裁切成该比例，防止投放不同比例的图导致卡片尺寸跳变 */
  ratio?: number;
  accept?: string[];
}

/**
 * 把 File 转成可直接作为 `image` 传给 HoloCard 的 object URL。
 * 解码、裁切、降采样都在这里完成，组件侧只做纹理上传。
 */
export async function prepareFile(file: File, options: PrepareOptions = {}): Promise<PreparedImage> {
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  await validateFile(file, { maxBytes: options.maxBytes, accept: options.accept });

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    const fallbackUrl = URL.createObjectURL(file);
    try {
      bitmap = await bitmapFromElement(fallbackUrl);
    } catch (error) {
      URL.revokeObjectURL(fallbackUrl);
      throw error instanceof HoloImageError
        ? error
        : new HoloImageError('decode', '图片解码失败', error);
    } finally {
      // 位图已在 drawFitted 中复制，释放临时地址
      URL.revokeObjectURL(fallbackUrl);
    }
  }

  const canvas = drawFitted(bitmap, bitmap.width, bitmap.height, maxDimension, options.ratio);
  bitmap.close();

  const type = file.type === 'image/png' ? 'image/png' : 'image/webp';
  let blob: Blob;
  try {
    blob = await canvasToBlob(canvas, type, 0.92);
  } catch {
    blob = await canvasToBlob(canvas, 'image/png', 1);
  }

  const url = URL.createObjectURL(blob);
  return {
    url,
    width: canvas.width,
    height: canvas.height,
    bytes: blob.size,
    type: blob.type,
    dispose: () => URL.revokeObjectURL(url)
  };
}

/** 把任意异常归一化成可展示的错误信息 */
export function toHoloError(error: unknown): HoloErrorInfo {
  if (error instanceof HoloImageError) {
    return { reason: error.reason, message: error.message, detail: error.detail };
  }
  const message = error instanceof Error ? error.message : String(error);
  return { reason: 'decode', message: message || '未知错误', detail: error };
}

export const ERROR_TEXT: Record<HoloErrorReason, string> = {
  type: '格式不支持，仅支持 JPG / PNG / WebP / AVIF / GIF / SVG',
  decode: '图片解码失败，文件可能已损坏',
  network: '图片请求失败，请检查网络或地址',
  cors: '该图片不允许跨域读取，请改用本地上传',
  tooLarge: '图片体积过大，请上传更小的文件',
  webgl: '当前浏览器不支持 WebGL2，已降级为静态卡片',
  empty: '文件为空'
};
