import { Bell, Heart, Star } from 'lucide-react';
import IconButton from '../IconButton';

export default function IconButtonBasic() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
      <IconButton icon={<Heart size={16} />} label="收藏" />
      <IconButton icon={<Star size={16} />} label="标星" variant="outline" />
      <IconButton icon={<Bell size={16} />} label="通知" variant="solid" />
    </div>
  );
}
