import { useState } from 'react';
import { Heart, Share2, Trash2 } from 'lucide-react';
import IconButton from '../IconButton';

export default function IconButtonStates() {
  const [liked, setLiked] = useState(true);

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
      <IconButton
        icon={<Heart size={16} />}
        label={liked ? '取消收藏' : '收藏'}
        active={liked}
        onClick={() => setLiked(value => !value)}
      />
      <IconButton icon={<Share2 size={16} />} label="分享" size="sm" />
      <IconButton icon={<Trash2 size={16} />} label="删除" size="lg" variant="outline" />
      <IconButton icon={<Trash2 size={16} />} label="删除（禁用）" disabled />
    </div>
  );
}
