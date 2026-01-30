package llm

// OpenAI-compatible chat completion types.

type ChatMessage struct {
	Role       string     `json:"role"`
	Content    string     `json:"content,omitempty"`
	ToolCalls  []ToolCall `json:"tool_calls,omitempty"`
	ToolCallID string     `json:"tool_call_id,omitempty"`
}

type ToolCall struct {
	ID       string       `json:"id"`
	Type     string       `json:"type"`
	Function FunctionCall `json:"function"`
}

type FunctionCall struct {
	Name      string `json:"name"`
	Arguments string `json:"arguments"`
}

type Tool struct {
	Type     string       `json:"type"`
	Function ToolFunction `json:"function"`
}

type ToolFunction struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Parameters  map[string]any `json:"parameters"`
}

type ToolChoice struct {
	Type     string             `json:"type"`
	Function ToolChoiceFunction `json:"function"`
}

type ToolChoiceFunction struct {
	Name string `json:"name"`
}

type ChatRequest struct {
	Model      string      `json:"model"`
	Messages   []ChatMessage `json:"messages"`
	Tools      []Tool      `json:"tools,omitempty"`
	ToolChoice *ToolChoice `json:"tool_choice,omitempty"`
}

type ChatResponse struct {
	Choices []ChatChoice `json:"choices"`
}

type ChatChoice struct {
	Message ChatMessage `json:"message"`
}

// Grading result types.

type CriterionResult struct {
	Score   bool   `json:"score"`
	Comment string `json:"comment"`
}

type GradingResult struct {
	PatternIdentified  CriterionResult `json:"pattern_identified"`
	SolutionWorks      CriterionResult `json:"solution_works"`
	ComplexityAnalysis CriterionResult `json:"complexity_analysis"`
	OptimalSolution    CriterionResult `json:"optimal_solution"`
	OverallFeedback    string          `json:"overall_feedback"`
}
