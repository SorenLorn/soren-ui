export default {
  name: 'Text Input',
  description: '带标签、提示与错误状态的单行输入框，支持前后缀图标和三种尺寸。',
  icon: 'TextCursorInput',
  status: 'stable',
  since: '2026-11',
  related: ['buttons/button'],
  props: [
    { name: 'label', type: 'string', description: '标签文案，自动关联 input' },
    { name: 'hint', type: 'string', description: '辅助提示，存在 error 时不显示' },
    { name: 'error', type: 'string', description: '错误信息，同时设置 aria-invalid' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: '尺寸' },
    { name: 'leading', type: 'ReactNode', default: 'null', description: '左侧图标' },
    { name: 'trailing', type: 'ReactNode', default: 'null', description: '右侧图标' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '禁用态' },
    { name: '...rest', type: 'InputHTMLAttributes', description: '其余原生属性透传给 input' }
  ]
};
