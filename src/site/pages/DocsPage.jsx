import { SITE } from '../config';
import usePageMeta from '../usePageMeta';
import { categories } from '../../library/registry';

export default function DocsPage() {
  usePageMeta({ title: `Docs · ${SITE.name}`, description: `${SITE.name} 目录约定与扩展方式` });

  return (
    <div className="sn-docpage">
      <div className="sn-content">
          <header className="sn-head">
            <p className="sn-eyebrow">Docs</p>
            <h1 className="sn-title">{SITE.name} 使用说明</h1>
            <p className="sn-desc">组件全部自建，按目录约定放文件即可自动出现在站点里。</p>
          </header>

          <section className="sd-section">
            <h2 className="sd-h2">目录约定</h2>
            <pre className="sd-code">{`src/library/
  <category>/                # 分类，如 buttons
    <component>/             # 组件，如 button
      Button.jsx             # 组件源码（源码区主文件，也支持 .tsx）
      Button.css             # 可选，样式一并进入源码区
      helpers.ts             # 可选，组件依赖的纯 TS 模块（同样进入源码区）
      examples/
        basic.jsx            # 一个文件 = 一个示例 = 一段可复制源码
      preview.jsx            # 可选，首页缩略展示（只渲染组件本体）
      meta.js                # 可选，{ name, description, status, props, related }`}</pre>
            <p className="sd-p">
              站点用 <code className="sd-inline-code">import.meta.glob</code> 自动扫描{' '}
              <code className="sd-inline-code">src/library</code>，新增文件后无需改动任何路由或清单。
            </p>
          </section>

          <section className="sd-section">
            <h2 className="sd-h2">新增组件</h2>
            <ul className="sd-list">
              <li>
                在对应分类目录下新建组件文件夹，例如 <code className="sd-inline-code">src/library/buttons/button</code>。
              </li>
              <li>放入组件源码与样式文件，源码区的文件 Tab 会自动按文件名生成切换。</li>
              <li>
                在 <code className="sd-inline-code">examples/</code> 下每个文件放一个可运行示例（默认导出），JSX 用{' '}
                <code className="sd-inline-code">return ( … )</code> 包裹；文件名即示例标题与源码文件名。
              </li>
              <li>
                示例卡「源码」会定位到对应文件并高亮 <code className="sd-inline-code">return ( … )</code> 之间的用法片段；
                「复制用法」在示例无本地状态时复制「import + 片段」，有 hook 时复制整份文件以保证可运行。
              </li>
              <li>
                用 <code className="sd-inline-code">meta.js</code> 覆盖显示名称、描述、状态与 API 表格数据（
                <code className="sd-inline-code">props</code>），不写则用文件夹名推导。
              </li>
              <li>
                想让它出现在首页展示区，写一个 <code className="sd-inline-code">preview.jsx</code> 作为缩略展示，并在{' '}
                <code className="sd-inline-code">src/library/popularity.js</code> 里补一条{' '}
                <code className="sd-inline-code">usage</code>（决定首页排序）。
              </li>
            </ul>
          </section>

          <section className="sd-section">
            <h2 className="sd-h2">新增分类</h2>
            <p className="sd-p">
              在 <code className="sd-inline-code">src/library</code> 下建同名文件夹，就会自动成为新分类；如果想指定显示名、描述和排序，
              在 <code className="sd-inline-code">src/library/categories.js</code> 的{' '}
              <code className="sd-inline-code">CATEGORY_META</code> 里加一条。
            </p>
            <p className="sd-p">
              当前分类：
              {categories.map(category => (
                <span key={category.slug} className="sd-inline-code" style={{ marginRight: 6 }}>
                  {category.name}
                </span>
              ))}
            </p>
          </section>

          <section className="sd-section">
            <h2 className="sd-h2">命令与快捷键</h2>
            <pre className="sd-code">{`npm run dev      # 本地开发
npm run build    # 生产构建
npm run preview  # 预览构建产物`}</pre>
            <ul className="sd-list">
              <li>
                <code className="sd-inline-code">Ctrl / ⌘ + K</code>：打开全局搜索（↑↓ 选择，Enter 打开，Esc 关闭）
              </li>
              <li>
                <code className="sd-inline-code">← / →</code>：组件页切换同分类的上/下一个组件
              </li>
              <li>
                <code className="sd-inline-code">#code=&lt;文件名&gt;</code> / <code className="sd-inline-code">?example=&lt;slug&gt;</code>
                ：直接定位到某个源码文件或示例
              </li>
            </ul>
          </section>
        </div>
    </div>
  );
}
