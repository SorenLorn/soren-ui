import HoloCard from '../HoloCard';

export default function HoloCardFlip() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <HoloCard image="/holo/pikachu.webp" backImage="/holo/mew.webp" alt="Flippable holo card" width={220} preset="crystal" />
      <span style={{ fontSize: 12, color: 'var(--text-dimmed)' }}>点击卡片翻面</span>
    </div>
  );
}
