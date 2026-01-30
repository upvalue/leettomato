interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function ProblemSearch({ value, onChange }: Props) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none">
        /
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search problems... (e.g., 'two sum' or '#1')"
        className="w-full bg-bg-surface border border-border rounded-xl pl-9 pr-4 py-3 text-fg-main placeholder-fg-muted focus:outline-none focus:border-tn-blue focus:ring-1 focus:ring-tn-blue/30 transition-all"
      />
    </div>
  );
}
