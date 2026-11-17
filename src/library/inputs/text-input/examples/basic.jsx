import TextInput from '../TextInput';

export default function TextInputBasic() {
  return (
    <div style={{ width: '100%', maxWidth: 360 }}>
      <TextInput label="Project name" placeholder="soren-ui" hint="用于新建项目时的展示名称。" />
    </div>
  );
}
