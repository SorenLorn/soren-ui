/**
 * 分类配置（唯一需要手动维护的地方）
 *
 * 新增分类：在 src/library/ 下建一个同名文件夹，然后在这里加一条记录。
 * 不在这里登记的分类也会被自动发现，名称由文件夹名推导，排在最后。
 */
export const CATEGORY_META = [
  {
    slug: 'segmented-controls',
    name: 'Segmented Controls',
    description: '切换视图、过滤列表用的分段控件。'
  },
  {
    slug: 'buttons',
    name: 'Buttons',
    description: '各类按钮与触发动作的基础控件。'
  },
  {
    slug: 'cards',
    name: 'Cards',
    description: '承载内容的卡片容器。'
  },
  {
    slug: 'inputs',
    name: 'Inputs',
    description: '表单输入与基础字段控件。'
  }
];
