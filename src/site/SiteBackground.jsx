import { useEffect, useRef } from 'react';

const FALLBACKS = {
  color: '#8f74ff',
  glintColor: '#cbb8ff',
  opacity: 0.34,
  columns: 120,
  rows: 26,
  slatWidth: 6,
  slatHeight: 30,
  horizon: 0.36,
  depthPower: 2,
  waveCount: 6,
  waveHeight: 24,
  speed: 0.6,
  glintThreshold: 0.7,
  glintIntensity: 0.7,
  fog: 0.95,
  filter: 'none',
  // 指针交互
  pointerRadius: 200,
  pointerStrength: 0.5,
  rippleStrength: 0.85,
  rippleSpeed: 260,
  rippleLife: 1.4,
  // 波形粗糙度（原版 chop：叠加二次谐波，让浪更碎）
  chop: 0.35,
  // 烟雾 / 墨雾氛围
  smokeCount: 5,
  smokeColor: '#8f74ff',
  smokeOpacity: 0.1,
  smokeSize: 620,
  smokeSpeed: 12
};

const seeded = seed => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

const BUCKETS = 4;
const STRIDE = 5; // x, y, w, h, wave

const toRgb = hex => {
  const value = String(hex).trim();
  const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(value);
  const full = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);

  if (short) {
    return {
      r: parseInt(short[1] + short[1], 16),
      g: parseInt(short[2] + short[2], 16),
      b: parseInt(short[3] + short[3], 16)
    };
  }

  if (full) {
    return { r: parseInt(full[1], 16), g: parseInt(full[2], 16), b: parseInt(full[3], 16) };
  }

  const digits = value.match(/\d+(\.\d+)?/g);
  if (digits && digits.length >= 3) {
    return { r: Number(digits[0]), g: Number(digits[1]), b: Number(digits[2]) };
  }

  return toRgb(FALLBACKS.color);
};

/**
 * Micro Slats 站点背景
 * - 外观参数全部来自 CSS 变量（见 css/background.css 的 .slats-bg）
 * - 绘制使用 Canvas 2D：透视网格 + 正弦浪涌 + 波峰高光
 */
export default function SiteBackground() {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: true });

    if (!host || !canvas || !ctx) return undefined;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    let config = { ...FALLBACKS };
    let data = new Float32Array(0);
    let size = { w: 0, h: 0 };
    let raf = 0;
    let last = 0;
    let elapsed = 0;
    let visible = true;
    let signature = '';

    // 指针交互状态：光标位置（吸附）+ 点击产生的涟漪
    const pointer = { x: 0, y: 0, active: false };
    let ripples = [];

    // 烟雾：预渲染一张柔光贴图，运行时只做 drawImage（加法混合）
    let smokeSprite = null;
    let smokeColorKey = '';
    let blobs = [];
    let blooms = [];

    const buildSmokeSprite = color => {
      const size = 320;
      const sprite = document.createElement('canvas');
      sprite.width = size;
      sprite.height = size;

      const sctx = sprite.getContext('2d');
      if (!sctx) return null;

      const { r, g, b } = toRgb(color);
      const rand = seeded(98765);

      // 叠 5 团圆斑，得到不规则烟团轮廓
      for (let i = 0; i < 5; i += 1) {
        const cx = size / 2 + (rand() - 0.5) * size * 0.36;
        const cy = size / 2 + (rand() - 0.5) * size * 0.36;
        const radius = size * (0.2 + rand() * 0.24);
        const gradient = sctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
        gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, 0.08)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        sctx.fillStyle = gradient;
        sctx.fillRect(0, 0, size, size);
      }

      return sprite;
    };

    const buildBlobs = count => {
      const rand = seeded(20261117);
      return Array.from({ length: count }, () => ({
        fx: 0.08 + rand() * 0.84,
        fy: 0.3 + rand() * 0.66,
        size: 0.8 + rand() * 0.7,
        alpha: 0.5 + rand() * 0.5,
        phase: rand() * Math.PI * 2,
        wander: 0.5 + rand() * 1.1
      }));
    };

    const readTokens = () => {
      const styles = getComputedStyle(host);

      const num = (name, fallback) => {
        const parsed = parseFloat(styles.getPropertyValue(name));
        return Number.isFinite(parsed) ? parsed : fallback;
      };

      const color = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;

      return {
        color: color('--slats-color', FALLBACKS.color),
        glintColor: color('--slats-glint-color', FALLBACKS.glintColor),
        opacity: num('--slats-opacity', FALLBACKS.opacity),
        columns: Math.max(6, Math.round(num('--slats-columns', FALLBACKS.columns))),
        rows: Math.max(4, Math.round(num('--slats-rows', FALLBACKS.rows))),
        slatWidth: Math.max(1, num('--slats-slat-width', FALLBACKS.slatWidth)),
        slatHeight: Math.max(1, num('--slats-slat-height', FALLBACKS.slatHeight)),
        horizon: num('--slats-horizon', FALLBACKS.horizon),
        depthPower: Math.max(1, num('--slats-depth-power', FALLBACKS.depthPower)),
        waveCount: num('--slats-wave-count', FALLBACKS.waveCount),
        waveHeight: num('--slats-wave-height', FALLBACKS.waveHeight),
        speed: num('--slats-speed', FALLBACKS.speed),
        glintThreshold: num('--slats-glint-threshold', FALLBACKS.glintThreshold),
        glintIntensity: num('--slats-glint-intensity', FALLBACKS.glintIntensity),
        fog: num('--slats-fog', FALLBACKS.fog),
        filter: color('--slats-filter', FALLBACKS.filter),
        pointerRadius: Math.max(40, num('--slats-pointer-radius', FALLBACKS.pointerRadius)),
        pointerStrength: Math.max(0, num('--slats-pointer-strength', FALLBACKS.pointerStrength)),
        rippleStrength: Math.max(0, num('--slats-ripple-strength', FALLBACKS.rippleStrength)),
        rippleSpeed: Math.max(40, num('--slats-ripple-speed', FALLBACKS.rippleSpeed)),
        rippleLife: Math.max(0.2, num('--slats-ripple-life', FALLBACKS.rippleLife)),
        chop: Math.max(0, num('--slats-chop', FALLBACKS.chop)),
        smokeCount: Math.max(0, Math.round(num('--slats-smoke-count', FALLBACKS.smokeCount))),
        smokeColor: color('--slats-smoke-color', FALLBACKS.smokeColor),
        smokeOpacity: Math.max(0, num('--slats-smoke-opacity', FALLBACKS.smokeOpacity)),
        smokeSize: Math.max(80, num('--slats-smoke-size', FALLBACKS.smokeSize)),
        smokeSpeed: Math.max(0, num('--slats-smoke-speed', FALLBACKS.smokeSpeed))
      };
    };

    /** 只在令牌真正变化时才重建缓冲，避免无谓分配 */
    const applyTokens = next => {
      const dimensionsChanged = next.columns !== config.columns || next.rows !== config.rows;
      config = next;
      canvas.style.filter = config.filter;

      if (dimensionsChanged || data.length === 0) {
        data = new Float32Array(config.columns * config.rows * STRIDE);
      }

      if (next.smokeColor !== smokeColorKey) {
        smokeColorKey = next.smokeColor;
        smokeSprite = buildSmokeSprite(next.smokeColor);
      }

      if (blobs.length !== next.smokeCount) {
        blobs = buildBlobs(next.smokeCount);
      }
    };

    const readConfig = () => {
      applyTokens(readTokens());
      signature = JSON.stringify(config);
    };

    /** 轮询令牌：改 CSS 变量后无需刷新即可生效（含 Vite HMR 热更新） */
    const syncTokens = () => {
      const next = readTokens();
      const key = JSON.stringify(next);
      if (key === signature) return;
      signature = key;
      applyTokens(next);
      resize();
      if (!raf && motionQuery.matches) draw(elapsed);
    };

    const draw = time => {
      const { w, h } = size;
      if (!w || !h) return;

      // 小屏再降一档密度，保证填充率
      const dense = w < 720;
      const cols = dense ? Math.max(6, Math.round(config.columns * 0.6)) : config.columns;
      const rows = dense ? Math.max(4, Math.round(config.rows * 0.72)) : config.rows;

      const base = toRgb(config.color);
      const glint = toRgb(config.glintColor);
      const horizonY = h * config.horizon;
      const plane = h - horizonY;
      const phase = time * config.speed;

      ctx.clearRect(0, 0, w, h);

      // 烟雾 / 墨雾：加法混合的柔光团，缓慢漂移，靠近光标时被轻微吸拢
      if (smokeSprite && config.smokeOpacity > 0 && blobs.length > 0) {
        ctx.globalCompositeOperation = 'lighter';
        const baseSize = config.smokeSize;

        for (let i = 0; i < blobs.length; i += 1) {
          const blob = blobs[i];
          const wander = time * 0.16 * blob.wander + blob.phase;
          let cx = blob.fx * w + Math.sin(wander) * 90 * blob.wander;
          let cy = blob.fy * h + Math.cos(wander * 0.8 + 1.2) * 42;

          let boost = 1;
          if (pointer.active) {
            const dx = pointer.x - cx;
            const dy = pointer.y - cy;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const influence = Math.max(0, 1 - distance / (config.pointerRadius * 2.4));
            cx += dx * influence * 0.05;
            cy += dy * influence * 0.05;
            boost += influence * 0.85;
          }

          const size = baseSize * blob.size * (0.94 + 0.06 * Math.sin(wander * 1.3));
          ctx.globalAlpha = Math.min(1, config.smokeOpacity * blob.alpha * boost);
          ctx.drawImage(smokeSprite, cx - size / 2, cy - size / 2, size, size);
        }

        // 点击墨雾：短暂绽开再淡出
        for (let k = blooms.length - 1; k >= 0; k -= 1) {
          const age = time - blooms[k].t;
          if (age > 1.6) {
            blooms.splice(k, 1);
            continue;
          }
          const fade = 1 - age / 1.6;
          const size = baseSize * (0.55 + age * 0.75);
          ctx.globalAlpha = Math.min(1, config.smokeOpacity * 2.4 * fade * fade);
          ctx.drawImage(smokeSprite, blooms[k].x - size / 2, blooms[k].y - size / 2, size, size);
        }

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = `rgb(${base.r}, ${base.g}, ${base.b})`;

      // 指针交互：光标吸附（局部下压 + 提亮）与点击涟漪
      const pointerActive = pointer.active && config.pointerStrength > 0;
      const pointerRadius = config.pointerRadius;
      const pointerRadiusSq = pointerRadius * pointerRadius;
      const pointerLift = config.pointerStrength * config.waveHeight;
      const px = pointer.x;
      const py = pointer.y;

      const liveRipples = [];
      for (let k = 0; k < ripples.length; k += 1) {
        const age = time - ripples[k].t;
        if (age <= config.rippleLife) liveRipples.push({ ...ripples[k], age });
      }
      ripples = liveRipples.map(ripple => ({ x: ripple.x, y: ripple.y, t: ripple.t }));

      let index = 0;
      const capacity = cols * rows * STRIDE;

      for (let row = 0; row < rows; row += 1) {
        const depthRatio = (row + 1) / rows;
        const depth = Math.pow(depthRatio, config.depthPower);
        const y = horizonY + plane * depth;
        const scale = 0.16 + 0.84 * depth;
        const spread = w * (0.55 + 1.2 * depth);
        const step = spread / cols;
        // 宽度不超过列间距的 72%，保证条块之间有缝、可读作“条板”
        const slatW = Math.max(1, Math.min(config.slatWidth * scale, step * 0.72));
        const slatH = Math.max(1.4, config.slatHeight * scale);
        const rowAlpha = config.opacity * (1 - config.fog * (1 - depthRatio));

        ctx.globalAlpha = Math.max(0, rowAlpha);

        const wavePhase = depthRatio * 2.4 + phase;
        const crestAllowed = depthRatio > 0.28;

        for (let col = 0; col < cols; col += 1) {
          const u = cols === 1 ? 0 : col / (cols - 1);
          const x = w / 2 + (u - 0.5) * spread + step * 0.5;
          const theta = u * config.waveCount * Math.PI * 2 + wavePhase;
          // chop：叠加二次谐波，让浪峰更尖、更接近原版的“碎浪”
          const wave = Math.sin(theta) + config.chop * 0.55 * Math.sin(theta * 2 + 0.9);

          let crest = wave;
          let lift = 0;

          if (pointerActive) {
            const dx = x - px;
            const dy = y - py;
            const distSq = dx * dx + dy * dy;
            if (distSq < pointerRadiusSq) {
              const falloff = 1 - distSq / pointerRadiusSq;
              const force = falloff * falloff;
              lift -= force * pointerLift;
              crest += force * 1.1;
            }
          }

          for (let k = 0; k < liveRipples.length; k += 1) {
            const ripple = liveRipples[k];
            const radius = 18 + ripple.age * config.rippleSpeed;
            const thickness = 22 + ripple.age * 26;
            const reach = radius + thickness * 2.6;
            const dx = x - ripple.x;
            const dy = y - ripple.y;
            const distSq = dx * dx + dy * dy;

            if (distSq > reach * reach) continue;

            const distance = Math.sqrt(distSq);
            const offset = distance - radius;
            const band = Math.exp(-(offset * offset) / (2 * thickness * thickness));
            const decay = 1 - ripple.age / config.rippleLife;

            lift -= band * config.rippleStrength * config.waveHeight * 1.4 * decay;
            crest = Math.max(crest, band * 1.9 * decay * config.rippleStrength);
          }

          const yOffset = y - wave * config.waveHeight * scale + lift * scale;

          ctx.fillRect(x, yOffset, slatW, slatH);

          if (crestAllowed && index + STRIDE <= capacity) {
            data[index] = x;
            data[index + 1] = yOffset;
            data[index + 2] = slatW;
            data[index + 3] = slatH;
            data[index + 4] = Math.min(1, crest);
            index += STRIDE;
          }
        }
      }

      // 波峰高光：按波浪值分档批量绘制，避免逐条改样式
      if (config.glintIntensity > 0 && index > 0) {
        ctx.fillStyle = `rgb(${glint.r}, ${glint.g}, ${glint.b})`;

        for (let bucket = 0; bucket < BUCKETS; bucket += 1) {
          const low = config.glintThreshold + ((1 - config.glintThreshold) * bucket) / BUCKETS;
          const high = config.glintThreshold + ((1 - config.glintThreshold) * (bucket + 1)) / BUCKETS;
          ctx.globalAlpha = config.opacity * config.glintIntensity * ((bucket + 1) / BUCKETS);

          for (let cursor = 0; cursor < index; cursor += STRIDE) {
            const crest = data[cursor + 4];
            if (crest < low || crest >= high) continue;
            ctx.fillRect(data[cursor], data[cursor + 1], data[cursor + 2], data[cursor + 3]);
          }
        }
      }

      // 指针光晕：跟随光标的柔光，让悬停有明确的视觉回应
      if (pointerActive) {
        const glowAlpha = Math.min(0.26, 0.06 + config.pointerStrength * 0.22);
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, pointerRadius);
        gradient.addColorStop(0, `rgba(${glint.r}, ${glint.g}, ${glint.b}, ${glowAlpha})`);
        gradient.addColorStop(0.55, `rgba(${glint.r}, ${glint.g}, ${glint.b}, ${glowAlpha * 0.35})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.globalAlpha = 1;
        ctx.fillStyle = gradient;
        ctx.fillRect(px - pointerRadius, py - pointerRadius, pointerRadius * 2, pointerRadius * 2);
      }

      // 点击涟漪：向外扩散的椭圆光环（透视压扁），随生命周期淡出
      if (config.rippleStrength > 0) {
        ctx.strokeStyle = `rgb(${glint.r}, ${glint.g}, ${glint.b})`;
        ctx.lineWidth = 1.4;

        for (let k = 0; k < liveRipples.length; k += 1) {
          const ripple = liveRipples[k];
          const progress = ripple.age / config.rippleLife;
          const radius = 18 + ripple.age * config.rippleSpeed;
          const alpha = (1 - progress) * 0.45 * Math.min(1, config.rippleStrength);

          if (alpha <= 0.01) continue;

          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.ellipse(ripple.x, ripple.y, radius, radius * 0.62, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      size = { w: host.clientWidth, h: host.clientHeight };

      canvas.width = Math.max(1, Math.round(size.w * dpr));
      canvas.height = Math.max(1, Math.round(size.h * dpr));
      canvas.style.width = `${size.w}px`;
      canvas.style.height = `${size.h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      draw(elapsed);
    };

    const tick = now => {
      raf = window.requestAnimationFrame(tick);
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += delta;
      draw(elapsed);
    };

    const start = () => {
      if (raf || !visible || motionQuery.matches) return;
      last = performance.now();
      raf = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!raf) return;
      window.cancelAnimationFrame(raf);
      raf = 0;
    };

    const applyMotionPreference = () => {
      if (motionQuery.matches) {
        stop();
        elapsed = 2.4; // 静态构图，保留一处波峰高光
        draw(elapsed);
      } else {
        start();
      }
    };

    const onVisibility = () => {
      visible = !document.hidden;
      if (visible) start();
      else stop();
    };

    readConfig();
    resize();
    applyMotionPreference();

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(host);

    // 主题切换时立即重读颜色变量（令牌轮询之外再做一次即时响应）
    const themeObserver = new MutationObserver(() => {
      readConfig();
      resize();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // 令牌轮询：改 CSS 变量后最多 0.7s 生效
    const tokenTimer = window.setInterval(syncTokens, 700);

    // 指针交互：背景层本身 pointer-events:none（不挡 UI），改为全局监听
    const onPointerMove = event => {
      if (motionQuery.matches) return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };

    const onPointerDown = event => {
      if (motionQuery.matches) return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;

      ripples.push({ x: event.clientX, y: event.clientY, t: elapsed });
      if (ripples.length > 8) ripples.shift();

      // 点击同时注入一团墨雾
      blooms.push({ x: event.clientX, y: event.clientY, t: elapsed });
      if (blooms.length > 4) blooms.shift();
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    document.addEventListener('visibilitychange', onVisibility);
    motionQuery.addEventListener('change', applyMotionPreference);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerout', onPointerLeave, { passive: true });
    window.addEventListener('blur', onPointerLeave);

    return () => {
      stop();
      window.clearInterval(tokenTimer);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      motionQuery.removeEventListener('change', applyMotionPreference);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerout', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
    };
  }, []);

  return (
    <div className="slats-bg" ref={hostRef} aria-hidden="true">
      <canvas className="slats-bg__canvas" ref={canvasRef} />
      <div className="slats-bg__glow" />
      <div className="slats-bg__vignette" />
    </div>
  );
}
