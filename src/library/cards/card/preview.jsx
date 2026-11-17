import Card from './Card';

/** 首页缩略展示：只呈现卡片本身，不加任何说明文字 */
export default function CardPreview() {
  return (
    <div style={{ width: '100%', maxWidth: 230 }}>
      <Card hoverable title="Project notes" description="卡片容器的基础形态。" />
    </div>
  );
}
