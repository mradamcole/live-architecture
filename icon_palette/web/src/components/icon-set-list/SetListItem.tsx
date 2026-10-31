import type { IconSetSummary } from "@/components/icon-selector/types";

type SetListItemProps = {
  set: IconSetSummary;
  checked: boolean;
  disabled: boolean;
  onToggle: (id: string, next: boolean) => void;
  onNameHoverStart?: (set: IconSetSummary, el: HTMLElement) => void;
  onNameHoverEnd?: () => void;
};

export function SetListItem({
  set,
  checked,
  disabled,
  onToggle,
  onNameHoverStart,
  onNameHoverEnd,
}: SetListItemProps) {
  return (
    <label
      className={`la-set-item ${checked ? "is-checked" : ""} ${disabled ? "is-disabled" : ""}`.trim()}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled && !checked}
        onChange={(e) => onToggle(set.id, e.target.checked)}
      />
      <span
        className="la-set-item__name"
        onPointerEnter={(e) => onNameHoverStart?.(set, e.currentTarget)}
        onPointerLeave={() => onNameHoverEnd?.()}
      >
        {set.name}
      </span>
      <span className="la-set-item__count">{set.count}</span>
    </label>
  );
}
