import { Layers } from 'lucide-react';
import Card from '../Card';

export default function CardWithMedia() {
  return (
    <div style={{ width: '100%', maxWidth: 280 }}>
      <Card
        hoverable
        media={<Layers size={26} />}
        title="Design tokens"
        description="媒体区可以放图标、缩略图或者任意节点。"
        footer={<span style={{ fontSize: 12, color: '#b9a6ff' }}>Open</span>}
      />
    </div>
  );
}
