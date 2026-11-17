export default {
  name: 'Button',
  description: '四种视觉变体、三种尺寸，支持图标、加载中与禁用状态。',
  icon: 'MousePointerClick',
  status: 'stable',
  since: '2026-11',
  related: ['inputs/text-input'],
  props: [
    { name: 'children', type: 'ReactNode', required: true, description: '按钮文案或内容' },
    { name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'outline'", default: "'primary'", description: '视觉变体' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: '尺寸' },
    { name: 'loading', type: 'boolean', default: 'false', description: '加载态，自动禁用点击并显示 spinner' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '禁用态' },
    { name: 'fullWidth', type: 'boolean', default: 'false', description: '占满父容器宽度' },
    { name: 'icon', type: 'ReactNode', default: 'null', description: '左侧图标' },
    { name: 'iconRight', type: 'ReactNode', default: 'null', description: '右侧图标（加载态下隐藏）' },
    { name: 'type', type: "'button' | 'submit' | 'reset'", default: "'button'", description: '原生 button type' }
  ]
};
