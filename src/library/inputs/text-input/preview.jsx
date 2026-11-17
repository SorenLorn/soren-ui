import TextInput from './TextInput';

/** 首页缩略展示：只呈现输入框本身，不加任何说明文字 */
export default function TextInputPreview() {
  return <TextInput label="Project name" placeholder="soren-ui" size="sm" />;
}
