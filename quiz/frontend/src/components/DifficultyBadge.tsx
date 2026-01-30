interface Props {
  difficulty: "Easy" | "Medium" | "Hard";
  size?: "sm" | "md";
}

const styles = {
  Easy: "text-tn-green bg-tn-green/20 border-tn-green/50",
  Medium: "text-tn-yellow bg-tn-yellow/20 border-tn-yellow/50",
  Hard: "text-tn-red bg-tn-red/20 border-tn-red/50",
} as const;

export function DifficultyBadge({ difficulty, size = "sm" }: Props) {
  const sizeClass = size === "md" ? "text-sm px-3 py-1" : "text-xs px-2 py-0.5";
  return (
    <span
      className={`font-semibold rounded-full border ${sizeClass} ${styles[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}
