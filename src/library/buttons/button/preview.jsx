import Button from './Button';

/** 首页缩略展示：只呈现按钮本身，不加任何说明文字 */
export default function ButtonPreview() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
      <Button size="sm">New project</Button>
      <Button size="sm" variant="secondary">
        Secondary
      </Button>
    </div>
  );
}
