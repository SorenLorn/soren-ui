export default {
  name: 'Segmented Control',
  description: '带滑动高亮块的分段切换控件，支持受控 / 非受控、三种尺寸与占满宽度。',
  icon: 'SlidersHorizontal',
  status: 'stable',
  since: '2026-11',
  related: ['buttons/button'],
  props: [
    {
      name: 'options',
      type: "{ value: string; label: string; icon?: ReactNode }[]",
      required: true,
      description: '分段项，value 唯一'
    },
    { name: 'value', type: 'string', description: '受控值，传入后组件进入受控模式' },
    { name: 'defaultValue', type: 'string', description: '非受控默认值，缺省取第一项' },
    { name: 'onChange', type: '(value: string) => void', description: '选中项变化回调' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: '尺寸' },
    { name: 'fullWidth', type: 'boolean', default: 'false', description: '撑满父容器并均分各段' },
    { name: 'ariaLabel', type: 'string', default: "'Segmented control'", description: 'tablist 的无障碍名称' }
  ]
};
