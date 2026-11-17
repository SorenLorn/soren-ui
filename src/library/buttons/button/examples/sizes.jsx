import { useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import Button from '../Button';

export default function ButtonSizes() {
  const [loading, setLoading] = useState(false);

  const submit = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
      <Button size="sm">Small</Button>
      <Button>Medium</Button>
      <Button size="lg">Large</Button>
      <Button variant="secondary" icon={<Plus size={15} />}>
        Icon
      </Button>
      <Button variant="secondary" loading={loading} onClick={submit}>
        Submit
      </Button>
      <Button variant="ghost" iconRight={<ArrowRight size={15} />}>
        Next
      </Button>
    </div>
  );
}
