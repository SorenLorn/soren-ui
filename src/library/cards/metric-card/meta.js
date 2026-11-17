export default {
  name: 'Metric Card',
  description: '指标卡片：主数值 + 单位 + 环比涨跌徽标，适合仪表盘与概览区块，使用 TSX + Tailwind 实现。',
  icon: 'LayoutGrid',
  status: 'stable',
  since: '2026-11',
  related: ['cards/card'],
  props: [
    { name: 'label', type: 'string', required: true, description: '指标名称' },
    { name: 'value', type: 'string | number', required: true, description: '主数值' },
    { name: 'unit', type: 'string', description: '数值单位，如 % / ms' },
    { name: 'delta', type: 'number', description: '环比变化百分比（正数为上涨），不传则不显示徽标' },
    { name: 'trend', type: "'up' | 'down' | 'flat'", default: "'flat'", description: '趋势方向，决定徽标配色与箭头' },
    { name: 'hint', type: 'string', description: '补充说明，如「vs last month」' },
    { name: 'icon', type: 'ReactNode', description: '右上角图标' },
    { name: 'className', type: 'string', description: '追加样式类，便于外部微调' }
  ]
};
