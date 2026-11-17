/**
 * 首页展示顺序（可选数据源）
 *
 * key   = `<分类 slug>/<组件 slug>`
 * usage = 排序权重，越大越靠前；只用于排序，不在界面上展示
 *
 * 未登记的组件不会出现在首页展示区，补齐一条即可。
 */
export const POPULARITY = {
  'buttons/button': { usage: 2480 },
  'segmented-controls/segmented-control': { usage: 1320 },
  'inputs/text-input': { usage: 960 },
  'cards/metric-card': { usage: 880 },
  'cards/card': { usage: 740 }
};
