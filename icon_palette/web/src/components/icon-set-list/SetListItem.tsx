import type { IconSetSummary } from "@/components/icon-selector/types";

type SetListItemProps = {
  set: IconSetSummary;
  checked: boolean;
  disabled: boolean;
  onToggle: (id: string, next: boolean) => void;
};

export function SetListItem({
  set,
  checked,
  disabled,
  onToggle,
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
      <span className="la-set-item__name">{set.name}</span>
      <span className="la-set-item__count">{set.count}</span>
    </label>
  );
}
