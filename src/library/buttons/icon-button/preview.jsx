import { Bell, Heart, Star } from 'lucide-react';
import IconButton from './IconButton';

/** 首页缩略展示：只呈现按钮本身 */
export default function IconButtonPreview() {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      <IconButton icon={<Heart size={15} />} label="收藏" size="sm" />
      <IconButton icon={<Star size={15} />} label="标星" size="sm" variant="outline" />
      <IconButton icon={<Bell size={15} />} label="通知" size="sm" variant="solid" />
    </div>
  );
}
