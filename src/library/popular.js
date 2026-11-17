import { categories } from './registry';

/**
 * 读取排序权重并与组件注册表做 join，按 usage 倒序返回。
 * 数据用动态 import，模块缺失 / 数据异常时由调用方展示失败态。
 */
export async function loadPopularComponents() {
  const { POPULARITY } = await import('./popularity');

  if (!POPULARITY || typeof POPULARITY !== 'object') {
    throw new Error('热度数据格式不正确');
  }

  const items = [];

  for (const category of categories) {
    for (const component of category.components) {
      const heat = POPULARITY[`${category.slug}/${component.slug}`];
      if (!heat || !Number.isFinite(heat.usage) || heat.usage <= 0) continue;

      items.push({
        ...component,
        usage: heat.usage
      });
    }
  }

  return items.sort((a, b) => b.usage - a.usage);
}
