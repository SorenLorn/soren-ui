export default {
  name: 'Icon Button',
  description: '纯图标按钮，强制 label 保证无障碍名称，支持三种变体、三种尺寸与激活态。',
  icon: 'MousePointerClick',
  status: 'stable',
  since: '2026-11',
  related: ['buttons/button'],
  props: [
    { name: 'icon', type: 'ReactNode', required: true, description: '图标节点（建议 16px）' },
    { name: 'label', type: 'string', required: true, description: '无障碍名称，同时作为 title 提示' },
    { name: 'variant', type: "'solid' | 'ghost' | 'outline'", default: "'ghost'", description: '视觉变体' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: '尺寸（30 / 36 / 44px）' },
    { name: 'active', type: 'boolean', default: 'false', description: '激活态，输出 aria-pressed' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '禁用态' }
  ]
};
