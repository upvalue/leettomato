export interface ProblemSummary {
  id: number;
  source_id: string;
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
}

export interface Problem extends ProblemSummary {
  source: string;
  description: string;
  examples: Example[];
  constraints: string[];
  hints: string[];
  python3_snippet: string;
}

export interface Example {
  example_num: number;
  example_text: string;
}

export interface ListResponse {
  problems: ProblemSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface CriterionResult {
  score: boolean;
  comment: string;
}

export interface GradingResult {
  pattern_identified: CriterionResult;
  solution_works: CriterionResult;
  complexity_analysis: CriterionResult;
  optimal_solution: CriterionResult;
  overall_feedback: string;
}

export interface GradeResponse {
  problem_id: number;
  result: GradingResult;
}
