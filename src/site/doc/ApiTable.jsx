const EMPTY = '—';

export default function ApiTable({ props = [] }) {
  if (props.length === 0) {
    return (
      <p className="doc-empty">
        该组件没有可配置的 props。需要补充时，在组件目录的 <code className="sd-inline-code">meta.js</code> 里添加{' '}
        <code className="sd-inline-code">props</code> 数组。
      </p>
    );
  }

  return (
    <div className="api-wrap">
      <table className="api-table">
        <thead>
          <tr>
            <th scope="col">属性</th>
            <th scope="col">类型</th>
            <th scope="col">默认值</th>
            <th scope="col">必填</th>
            <th scope="col">说明</th>
          </tr>
        </thead>
        <tbody>
          {props.map(item => (
            <tr key={item.name}>
              <td data-label="属性">
                <code>{item.name}</code>
              </td>
              <td data-label="类型">
                <code>{item.type ?? EMPTY}</code>
              </td>
              <td data-label="默认值">
                <code>{item.default ?? EMPTY}</code>
              </td>
              <td data-label="必填">{item.required ? '是' : '否'}</td>
              <td data-label="说明">{item.description ?? EMPTY}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
