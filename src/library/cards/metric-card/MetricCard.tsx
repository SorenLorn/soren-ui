import type { ReactNode } from 'react';

export type MetricTrend = 'up' | 'down' | 'flat';

export interface MetricCardProps {
  /** 指标名称 */
  label: string;
  /** 主数值 */
  value: string | number;
  /** 数值单位，如 % / ms */
  unit?: string;
  /** 环比变化百分比（正数即上涨），不传则不显示徽标 */
  delta?: number;
  /** 趋势方向，决定徽标配色与箭头 */
  trend?: MetricTrend;
  /** 补充说明，如「vs last month」 */
  hint?: string;
  /** 右上角图标 */
  icon?: ReactNode;
  /** 追加样式类 */
  className?: string;
}

const TREND_STYLES: Record<MetricTrend, { badge: string; arrow: string }> = {
  up: { badge: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300', arrow: '↑' },
  down: { badge: 'border-rose-400/25 bg-rose-400/10 text-rose-300', arrow: '↓' },
  flat: { badge: 'border-white/10 bg-white/5 text-neutral-400', arrow: '→' }
};

export default function MetricCard({
  label,
  value,
  unit,
  delta,
  trend = 'flat',
  hint,
  icon,
  className = ''
}: MetricCardProps) {
  const tone = TREND_STYLES[trend];

  return (
    <div
      className={`flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-[#161616] p-5 text-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-colors duration-200 hover:border-white/20 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12.5px] font-medium tracking-wide text-neutral-400">{label}</span>
        {icon ? <span className="text-neutral-500">{icon}</span> : null}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-[26px] font-semibold leading-none tracking-tight">{value}</span>
        {unit ? <span className="text-[13px] text-neutral-500">{unit}</span> : null}
      </div>

      <div className="flex min-h-[20px] flex-wrap items-center gap-2">
        {typeof delta === 'number' ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tone.badge}`}
            title={`环比 ${delta}%`}
          >
            <span aria-hidden="true">{tone.arrow}</span>
            {Math.abs(delta)}%
          </span>
        ) : null}
        {hint ? <span className="text-[11.5px] text-neutral-500">{hint}</span> : null}
      </div>
    </div>
  );
}
