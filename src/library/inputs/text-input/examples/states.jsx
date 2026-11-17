import { Search } from 'lucide-react';
import TextInput from '../TextInput';

export default function TextInputStates() {
  return (
    <div style={{ display: 'grid', gap: 16, width: '100%', maxWidth: 360 }}>
      <TextInput label="Search" placeholder="Search components…" leading={<Search size={14} />} defaultValue="button" />
      <TextInput label="Email" defaultValue="not-an-email" error="Please enter a valid email address." />
      <TextInput label="Disabled" defaultValue="Read only" disabled />
    </div>
  );
}
