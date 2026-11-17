import Card from '../Card';

export default function CardBasic() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 14,
        width: '100%',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
      }}
    >
      <Card hoverable title="Project notes" description="带 hover 抬升的卡片，适合列表与网格场景。" />
      <Card title="Static card" description="不带交互的基础卡片形态。" />
    </div>
  );
}
