interface Props {
  name: string;
  onClick?: () => void;
  active?: boolean;
}

export function TopicTag({ name, onClick, active }: Props) {
  const base = "text-xs px-2.5 py-1 rounded-md font-medium";
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${base} transition-colors ${
          active
            ? "bg-tn-blue text-bg-main"
            : "bg-bg-highlight/60 text-fg-muted hover:text-fg-main hover:bg-bg-highlight"
        }`}
      >
        {name}
      </button>
    );
  }
  return (
    <span className={`${base} bg-bg-highlight/60 text-fg-muted`}>{name}</span>
  );
}
