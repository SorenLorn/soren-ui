import HoloCard from '../HoloCard';

export default function HoloCardBasic() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <HoloCard image="/holo/pikachu.webp" alt="Pikachu holo card" width={250} preset="bursts" />
    </div>
  );
}
