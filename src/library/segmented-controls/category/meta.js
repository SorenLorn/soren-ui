export default {
  name: 'Category',
  description: 'iOS 风格毛玻璃分类切换控件：等分滑块、方向键切换、按压回弹，深浅色均自适应。',
  icon: 'SlidersHorizontal',
  status: 'stable',
  since: '2026-11',
  related: ['segmented-controls/segmented-control', 'buttons/button'],
  props: [
    {
      name: 'options',
      type: 'readonly CategoryOption[]',
      description: '分类选项，默认 Ladies / Men / Unisex'
    },
    { name: 'defaultValue', type: 'string', description: '初始选中项，默认取第一项' },
    { name: 'onChange', type: '(value: string) => void', description: '选中项变化回调，点击已选中项不触发' },
    { name: 'ariaLabel', type: 'string', default: "'Category'", description: 'radiogroup 的无障碍名称' },
    { name: 'className', type: 'string', default: "''", description: '追加到最外层容器的类名' }
  ]
};
