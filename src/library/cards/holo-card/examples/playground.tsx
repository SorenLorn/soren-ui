import { useCallback, useEffect, useRef, useState } from 'react';

import HoloCard from '../HoloCard';
import type { HoloPreset, HoloStatus } from '../HoloCard';
import {
  DEFAULT_MAX_BYTES,
  ERROR_TEXT,
  SUPPORTED_MIME,
  prepareFile,
  toHoloError,
  validateFile
} from '../imagePipeline';
import type { HoloErrorInfo } from '../imagePipeline';
import { useImageDrop, useImagePaste } from '../useImageDrop';

/** 卡面裁切比例，与原项目保持一致（63 : 88） */
const CARD_RATIO = 63 / 88;

const SAMPLES: { name: string; image: string; preset: HoloPreset }[] = [
  { name: 'Pikachu', image: '/holo/pikachu.webp', preset: 'bursts' },
  { name: 'Mew', image: '/holo/mew.webp', preset: 'glitter' },
  { name: 'Maushold', image: '/holo/maushold.webp', preset: 'rainbow' }
];

/** 一级：burst 烟花纹 + 4 套 OPCG 花纹 */
const OPCG_OPTIONS: { value: HoloPreset; label: string }[] = [
  { value: 'bursts', label: 'burst 烟花纹' },
  { value: 'crystal', label: 'OP 碎星闪' },
  { value: 'grate', label: 'OP 光栅镭射闪' },
  { value: 'ripple', label: 'OP 波纹闪' },
  { value: 'diagonal', label: 'OP 对角线爆闪' }
];

/** 二级：原有其它预设，收进分组保持完全可用 */
const LEGACY_OPTIONS: { value: HoloPreset; label: string }[] = [
  { value: 'stars', label: 'stars 星芒' },
  { value: 'shards', label: 'shards 碎冰' },
  { value: 'cosmos', label: 'cosmos 星云' },
  { value: 'rainbow', label: 'rainbow 彩虹' },
  { value: 'swirl', label: 'swirl 旋涡' },
  { value: 'glitter', label: 'glitter 闪粉' },
  { value: 'gold', label: 'gold 镭射金' }
];

type Phase = 'idle' | 'validating' | 'decoding' | 'ready';

const PHASE_TEXT: Record<Phase, string> = {
  idle: '待投放',
  validating: '校验中',
  decoding: '解码中',
  ready: '就绪'
};

const RENDER_TEXT: Record<HoloStatus, string> = {
  idle: '空卡',
  loading: '上传纹理',
  ready: '实时渲染',
  error: '异常'
};

const formatBytes = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * Holo Card 交互台：替换卡牌 / 切换光纹 / 加深光纹
 * 行为与原项目 App.tsx 一致：拖拽、点选、粘贴三种投放方式共用同一条图片管线。
 */
export default function HoloCardPlayground() {
  const [imageUrl, setImageUrl] = useState(SAMPLES[0].image);
  const [preset, setPreset] = useState<HoloPreset>(SAMPLES[0].preset);
  const [intensity, setIntensity] = useState(0.85);
  const [scale, setScale] = useState(0.95);
  const [phase, setPhase] = useState<Phase>('ready');
  const [renderStatus, setRenderStatus] = useState<HoloStatus>('idle');
  const [error, setError] = useState<HoloErrorInfo | null>(null);
  const [meta, setMeta] = useState<{ name: string; width: number; height: number; bytes: number; type: string } | null>(null);
  const [nonce, setNonce] = useState(0);

  const requestRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // object URL 随 imageUrl 生命周期回收，避免卸载/替换后泄漏
  useEffect(() => {
    if (!imageUrl.startsWith('blob:')) return undefined;
    return () => URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  const applyFile = useCallback(async (file: File) => {
    const token = ++requestRef.current;
    setError(null);
    setPhase('validating');

    try {
      await validateFile(file);
      if (token !== requestRef.current) return;

      setPhase('decoding');
      const prepared = await prepareFile(file, { maxDimension: 2048, ratio: CARD_RATIO });
      if (token !== requestRef.current) {
        prepared.dispose();
        return;
      }

      setImageUrl(prepared.url);
      setMeta({
        name: file.name,
        width: prepared.width,
        height: prepared.height,
        bytes: prepared.bytes,
        type: prepared.type || file.type
      });
      setNonce(value => value + 1);
      setPhase('ready');
    } catch (thrown) {
      if (token !== requestRef.current) return;
      setPhase('ready');
      setError(toHoloError(thrown));
    }
  }, []);

  const { active, bind } = useImageDrop({ onFile: applyFile, onReject: setError });
  useImagePaste(applyFile);

  const busy = phase === 'validating' || phase === 'decoding' || renderStatus === 'loading';

  const loadSample = (index: number) => {
    const sample = SAMPLES[index];
    requestRef.current += 1;
    setError(null);
    setMeta(null);
    setImageUrl(sample.image);
    setPreset(sample.preset);
    setNonce(value => value + 1);
    setPhase('ready');
  };

  const statusPill = error
    ? 'bg-rose-500/15 text-rose-200'
    : renderStatus === 'ready'
      ? 'bg-emerald-500/15 text-emerald-200'
      : 'bg-white/10 text-white/60';

  const dot = error ? 'bg-rose-400' : renderStatus === 'ready' ? 'bg-emerald-400' : 'bg-white/40';

  return (
    <div className="w-full max-w-[560px] rounded-2xl border border-white/10 bg-[#0b0b0f]/85 p-3 text-neutral-200">
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(212px, 1fr))' }}
      >
        {/* 卡牌投放区：拖拽落点 + 卡面舞台 */}
        <section
          {...bind}
          aria-label="卡牌投放区"
          className={`relative flex min-h-[252px] items-center justify-center overflow-hidden rounded-xl border p-3 transition-colors duration-200 ${
            active ? 'border-sky-400/70 bg-sky-400/[0.06]' : 'border-white/10 bg-white/[0.02] hover:border-white/25'
          }`}
        >
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-2 rounded-lg border-2 border-dashed transition-opacity duration-200 ${
              active ? 'border-sky-400/60 opacity-100' : 'border-white/10 opacity-0'
            }`}
          />

          <HoloCard
            image={imageUrl}
            imageKey={nonce}
            alt="全息卡面"
            preset={preset}
            intensity={intensity}
            scale={scale}
            ratioMode="fixed"
            width={190}
            radius={14}
            tiltMax={16}
            hoverScale={1.05}
            onStateChange={setRenderStatus}
            onError={setError}
          />

          {active ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-2.5 text-center">
              <span className="rounded-full bg-sky-400/15 px-3 py-1 text-[10.5px] font-medium text-sky-200">
                松手替换卡面
              </span>
            </div>
          ) : null}
        </section>

        <aside className="flex min-w-0 flex-col gap-2">
          {/* 渲染状态：图片处理阶段与纹理上传共用同一条进度 */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[9.5px] font-medium tracking-[0.18em] text-white/35 uppercase">状态</span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusPill}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                {PHASE_TEXT[phase]} · {RENDER_TEXT[renderStatus]}
              </span>
            </div>

            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full bg-sky-400 transition-all duration-300 ${
                  busy ? 'w-2/3 animate-pulse' : renderStatus === 'ready' ? 'w-full' : 'w-0'
                }`}
              />
            </div>

            <dl className="mt-2 space-y-1 text-[10.5px]">
              <div className="flex justify-between gap-3">
                <dt className="text-white/35">文件名</dt>
                <dd className="truncate text-white/70">{meta?.name ?? '内置示例图'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/35">纹理尺寸</dt>
                <dd className="text-white/70">{meta ? `${meta.width} × ${meta.height}` : '跟随原图'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/35">上传体积</dt>
                <dd className="text-white/70">{meta ? formatBytes(meta.bytes) : '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/35">编码</dt>
                <dd className="truncate text-white/70">{meta?.type ?? '—'}</dd>
              </div>
            </dl>
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-rose-400/25 bg-rose-500/10 p-2.5 text-[10.5px] text-rose-100"
            >
              <p className="font-medium">{ERROR_TEXT[error.reason]}</p>
              <p className="mt-1 line-clamp-2 text-rose-200/70">{error.message}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="mt-2 rounded-md bg-rose-400/15 px-2.5 py-0.5 text-[10px] font-medium text-rose-100 transition hover:bg-rose-400/25"
              >
                忽略
              </button>
            </div>
          ) : null}

          {/* 光纹控制：预设 + 强度 + 密度，改参数不重新上传纹理 */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
            <label htmlFor="holo-preset" className="block text-[9.5px] font-medium tracking-[0.18em] text-white/35 uppercase">
              闪光花纹
            </label>
            <select
              id="holo-preset"
              value={preset}
              onChange={event => setPreset(event.target.value as HoloPreset)}
              className="mt-1.5 w-full appearance-none rounded-lg border border-white/15 bg-[#15131f] px-2.5 py-1.5 text-[12px] text-white/85 outline-none transition hover:border-white/30 focus:border-sky-400/70"
            >
              <optgroup label="烟花纹 / OPCG 闪光">
                {OPCG_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="原有其它预设">
                {LEGACY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            </select>

            <label className="mt-3 block text-[10px] text-white/45">
              <span className="flex justify-between">
                箔面强度 <span className="text-white/70">{intensity.toFixed(2)}</span>
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={intensity}
                onChange={event => setIntensity(Number(event.target.value))}
                className="mt-1.5 w-full accent-sky-400"
              />
            </label>

            <label className="mt-2.5 block text-[10px] text-white/45">
              <span className="flex justify-between">
                图案密度 <span className="text-white/70">{scale.toFixed(2)}</span>
              </span>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.05}
                value={scale}
                onChange={event => setScale(Number(event.target.value))}
                className="mt-1.5 w-full accent-sky-400"
              />
            </label>
          </div>

          {/* 卡牌来源：点选 / 恢复示例 / 快捷样例 */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex-1 rounded-lg bg-white px-3 py-1.5 text-[11.5px] font-medium text-slate-900 transition hover:bg-white/85"
            >
              选择图片
            </button>
            <button
              type="button"
              onClick={() => loadSample(0)}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-[11.5px] font-medium text-white/70 transition hover:border-white/30 hover:text-white"
            >
              恢复示例
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={SUPPORTED_MIME.join(',')}
              className="hidden"
              onChange={event => {
                const file = event.target.files?.[0];
                if (file) void applyFile(file);
                event.target.value = '';
              }}
            />
          </div>

          <div className="flex gap-1.5">
            {SAMPLES.map((sample, index) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => loadSample(index)}
                className="flex-1 rounded-md border border-white/10 bg-white/[0.02] px-1.5 py-1 text-[10px] text-white/50 transition hover:border-white/25 hover:text-white/80"
              >
                {sample.name}
              </button>
            ))}
          </div>

          <p className="text-[10px] leading-relaxed text-white/25">
            支持拖入 / 点选 / Ctrl + V 粘贴，单文件 ≤ {Math.round(DEFAULT_MAX_BYTES / 1024 / 1024)} MB，
            上传前统一按卡片比例裁切并降采样至 2048px 以内。
          </p>
        </aside>
      </div>
    </div>
  );
}
