export default {
  name: 'Card',
  description: '内容卡片容器，支持媒体区、标题、描述、页脚与可选 hover 抬升效果。',
  icon: 'LayoutGrid',
  status: 'stable',
  since: '2026-11',
  related: ['buttons/button'],
  props: [
    { name: 'title', type: 'string', description: '卡片标题' },
    { name: 'description', type: 'string', description: '卡片描述' },
    { name: 'media', type: 'ReactNode', default: 'null', description: '顶部媒体区，可放图标或缩略图' },
    { name: 'footer', type: 'ReactNode', default: 'null', description: '底部操作区' },
    { name: 'hoverable', type: 'boolean', default: 'false', description: 'hover 时抬升并显示紫色描边' },
    { name: 'children', type: 'ReactNode', description: '描述下方的自定义内容' }
  ]
};
