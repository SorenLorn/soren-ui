import HoloCard from '../HoloCard';

export default function HoloCardPresets() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18 }}>
      <HoloCard image="/holo/pikachu.webp" alt="Bursts preset" width={156} preset="bursts" intensity={0.9} />
      <HoloCard image="/holo/mew.webp" alt="Glitter preset" width={156} preset="glitter" intensity={0.7} />
      <HoloCard image="/holo/maushold.webp" alt="Rainbow preset" width={156} preset="rainbow" intensity={0.85} />
    </div>
  );
}
