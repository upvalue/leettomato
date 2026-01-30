package llm

import (
	"encoding/json"
	"fmt"

	"github.com/leettomato/quiz/internal/db"
)

var gradingTool = Tool{
	Type: "function",
	Function: ToolFunction{
		Name:        "submit_grading",
		Description: "Submit the structured grading result for a candidate's coding interview answer.",
		Parameters: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"pattern_identified": map[string]any{
					"type":        "object",
					"description": "Did the candidate identify the correct algorithmic pattern (e.g., hash map, two-pointer, BFS, DP, sliding window)?",
					"properties": map[string]any{
						"score":   map[string]any{"type": "boolean", "description": "true if the candidate identified the correct pattern"},
						"comment": map[string]any{"type": "string", "description": "Brief explanation of what pattern was expected and what the candidate identified"},
					},
					"required": []string{"score", "comment"},
				},
				"solution_works": map[string]any{
					"type":        "object",
					"description": "Would the candidate's described approach produce correct results for all valid inputs?",
					"properties": map[string]any{
						"score":   map[string]any{"type": "boolean", "description": "true if the approach would produce correct results"},
						"comment": map[string]any{"type": "string", "description": "Brief explanation of correctness, noting any edge cases missed"},
					},
					"required": []string{"score", "comment"},
				},
				"complexity_analysis": map[string]any{
					"type":        "object",
					"description": "Did the candidate state correct time AND space complexity for their approach?",
					"properties": map[string]any{
						"score":   map[string]any{"type": "boolean", "description": "true if both time and space complexity are correctly stated"},
						"comment": map[string]any{"type": "string", "description": "Brief explanation of expected vs stated complexity"},
					},
					"required": []string{"score", "comment"},
				},
				"optimal_solution": map[string]any{
					"type":        "object",
					"description": "Is the candidate's solution optimal (best known time complexity for this problem)?",
					"properties": map[string]any{
						"score":   map[string]any{"type": "boolean", "description": "true if the solution achieves optimal time complexity"},
						"comment": map[string]any{"type": "string", "description": "Brief explanation of what optimal looks like and how the candidate's approach compares"},
					},
					"required": []string{"score", "comment"},
				},
				"overall_feedback": map[string]any{
					"type":        "string",
					"description": "2-3 sentence constructive summary of the candidate's answer, highlighting strengths and areas for improvement.",
				},
			},
			"required": []string{"pattern_identified", "solution_works", "complexity_analysis", "optimal_solution", "overall_feedback"},
		},
	},
}

func buildSystemPrompt() string {
	return `You are an expert coding interview grader. You evaluate candidate answers to LeetCode-style problems.

The candidate provides a text/pseudocode solution outline — NOT runnable code. Your job is to assess their understanding of the problem, their approach, and their analysis.

Grade strictly but fairly:
- "Pattern identified" means they named or clearly described the correct algorithmic technique (e.g., "use a hash map to store complements" for Two Sum).
- "Solution works" means their described steps would produce correct output for all valid inputs, including edge cases.
- "Complexity analysis" requires BOTH time and space complexity to be correctly stated.
- "Optimal solution" means they achieve the best known time complexity. A correct but suboptimal approach (e.g., O(n²) brute force when O(n) exists) should fail this criterion.

You MUST call the submit_grading function with your assessment.`
}

func buildUserPrompt(problem *db.Problem, answer string) string {
	prompt := fmt.Sprintf(`## Problem: %s (#%s) [%s]

### Description
%s

### Examples
`, problem.Title, problem.SourceID, problem.Difficulty, problem.Description)

	for _, ex := range problem.Examples {
		if m, ok := ex.(map[string]any); ok {
			if text, ok := m["example_text"].(string); ok {
				prompt += text + "\n\n"
			}
		}
	}

	if len(problem.Constraints) > 0 {
		prompt += "### Constraints\n"
		for _, c := range problem.Constraints {
			prompt += "- " + c + "\n"
		}
		prompt += "\n"
	}

	if problem.Python3Snippet != "" {
		prompt += "### Python3 Function Signature\n```python\n" + problem.Python3Snippet + "\n```\n\n"
	}

	prompt += "---\n\n## Candidate's Answer\n\n" + answer

	return prompt
}

// Grade sends the candidate's answer to the LLM for structured grading.
func (c *Client) Grade(problem *db.Problem, answer string) (*GradingResult, error) {
	req := ChatRequest{
		Messages: []ChatMessage{
			{Role: "system", Content: buildSystemPrompt()},
			{Role: "user", Content: buildUserPrompt(problem, answer)},
		},
		Tools: []Tool{gradingTool},
		ToolChoice: &ToolChoice{
			Type:     "function",
			Function: ToolChoiceFunction{Name: "submit_grading"},
		},
	}

	resp, err := c.ChatCompletion(req)
	if err != nil {
		return nil, fmt.Errorf("chat completion: %w", err)
	}

	if len(resp.Choices) == 0 {
		return nil, fmt.Errorf("no choices in response")
	}

	msg := resp.Choices[0].Message
	if len(msg.ToolCalls) == 0 {
		return nil, fmt.Errorf("no tool calls in response (content: %s)", msg.Content)
	}

	var result GradingResult
	if err := json.Unmarshal([]byte(msg.ToolCalls[0].Function.Arguments), &result); err != nil {
		return nil, fmt.Errorf("unmarshal grading result: %w", err)
	}

	return &result, nil
}
