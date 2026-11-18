import HoloCard from './HoloCard';

/** 首页缩略展示：只呈现卡片本身 */
export default function HoloCardPreview() {
  return <HoloCard image="/holo/pikachu.webp" width={148} preset="bursts" idle={false} />;
}
