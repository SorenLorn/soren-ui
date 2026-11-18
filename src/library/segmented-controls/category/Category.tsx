import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';

/** 分类选项的唯一标识（内置 ladies / men / unisex，可传任意字符串扩展） */
export type CategoryId = string;

/** 单个分类选项 */
export interface CategoryOption {
  readonly id: CategoryId;
  readonly label: string;
}

/** 组件对外暴露的属性 */
export interface CategoryProps {
  /** 可选项，默认 Ladies / Men / Unisex */
  readonly options?: readonly CategoryOption[];
  /** 初始选中项，默认取第一项 */
  readonly defaultValue?: CategoryId;
  /** 选中项变化时的回调（点击已选中项不会触发） */
  readonly onChange?: (value: CategoryId) => void;
  /** 无障碍名称 */
  readonly ariaLabel?: string;
  /** 追加到最外层容器的类名 */
  readonly className?: string;
}

/** 默认分类选项 */
export const DEFAULT_CATEGORY_OPTIONS: readonly CategoryOption[] = [
  { id: 'ladies', label: 'Ladies' },
  { id: 'men', label: 'Men' },
  { id: 'unisex', label: 'Unisex' },
];

const ARROW_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

/** 滑块位移与松手回弹共用同一条曲线：240ms，先快后缓，不用匀速 ease */
const MOTION =
  'transition-transform duration-[240ms] ease-[cubic-bezier(0.25,0.8,0.3,1)] motion-reduce:transition-none';

/** 轨道：低透明度底 + 适度模糊，通透但不发白 */
const TRACK_CLASS = [
  'relative isolate flex w-full touch-manipulation items-center',
  'rounded-[9px] p-[2px]',
  'border border-black/[0.06] bg-[rgba(118,118,128,0.12)]',
  'backdrop-blur-xl backdrop-saturate-150',
  'dark:border-white/[0.08] dark:bg-[rgba(118,118,128,0.24)]',
].join(' ');

/** 滑块：浅色纯白双层投影，深色退回系统灰，避免深色下发亮 */
const THUMB_CLASS = [
  'pointer-events-none absolute top-[2px] bottom-[2px] left-[2px] rounded-[7px]',
  'bg-white shadow-[0_3px_8px_rgba(0,0,0,0.12),0_3px_1px_rgba(0,0,0,0.04)]',
  'dark:bg-[#636366] dark:shadow-[0_3px_8px_rgba(0,0,0,0.42)]',
  MOTION,
].join(' ');

/** 分段按钮：按压只做瞬时缩放，hover 一律不动背景 */
const ITEM_CLASS = [
  'group relative z-10 flex-1 cursor-pointer touch-manipulation select-none',
  'rounded-[7px] px-2 py-[5px] outline-none',
  '[-webkit-tap-highlight-color:transparent]',
  MOTION,
  'active:scale-[0.97] active:duration-[80ms]',
  'focus-visible:ring-2 focus-visible:ring-[#007aff]/60 dark:focus-visible:ring-white/40',
].join(' ');

/** 文字：13px / -0.01em 与原有控件保持一致，仅颜色与透明度过渡 */
const LABEL_CLASS =
  'block text-[13px] leading-[18px] font-semibold tracking-[-0.01em] whitespace-nowrap transition-[color,opacity] duration-[160ms] ease-out motion-reduce:transition-none';

const LABEL_ON = 'text-black dark:text-white';

const LABEL_OFF = [
  'text-[#3c3c43]/60 dark:text-white/60',
  'group-hover:text-[#3c3c43]/85 dark:group-hover:text-white/85',
  'group-active:opacity-70',
].join(' ');

/**
 * iPhone 原生 UISegmentedControl 风格的分段控件
 *
 * - 位移 / 回弹：240ms cubic-bezier(0.25, 0.8, 0.3, 1)
 * - 按压：active scale 0.97，仅按下瞬间生效（80ms 压下，240ms 回弹）
 * - hover：只调文字不透明度，不改背景、不改尺寸
 * - 深色模式：轨道更低透明度 + 系统灰滑块，模糊量克制，避免发白
 */
const Category = ({
  options = DEFAULT_CATEGORY_OPTIONS,
  defaultValue,
  onChange,
  ariaLabel = 'Category',
  className = '',
}: CategoryProps) => {
  const [selectedId, setSelectedId] = useState<CategoryId>(
    defaultValue ?? options[0]?.id ?? 'ladies',
  );

  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  /** 当前选中项下标；找不到时回退到 0，保证滑块始终有效 */
  const activeIndex = useMemo(() => {
    const index = options.findIndex((option) => option.id === selectedId);
    return index === -1 ? 0 : index;
  }, [options, selectedId]);

  const selectCategory = useCallback(
    (next: CategoryId) => {
      if (next === selectedId) return;
      setSelectedId(next);
      onChange?.(next);
    },
    [onChange, selectedId],
  );

  /** 左右 / 上下方向键切换，与系统分段控件操作习惯一致 */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!ARROW_KEYS.includes(event.key) || options.length === 0) return;
    event.preventDefault();

    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = (activeIndex + step + options.length) % options.length;
    const nextOption = options[nextIndex];
    if (!nextOption) return;

    selectCategory(nextOption.id);
    optionRefs.current[nextIndex]?.focus();
  };

  /** 滑块等分，位移用百分比推进，无需测量 DOM */
  const segmentCount = options.length || 1;
  const thumbStyle: CSSProperties = {
    width: `calc((100% - 4px) / ${segmentCount})`,
    transform: `translate3d(${activeIndex * 100}%, 0, 0)`,
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={[TRACK_CLASS, className].join(' ')}
    >
      <span aria-hidden="true" style={thumbStyle} className={THUMB_CLASS} />

      {options.map((option, index) => {
        const isSelected = index === activeIndex;

        return (
          <button
            key={option.id}
            ref={(element) => {
              optionRefs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => selectCategory(option.id)}
            className={ITEM_CLASS}
          >
            <span className={[LABEL_CLASS, isSelected ? LABEL_ON : LABEL_OFF].join(' ')}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default Category;
