package handler

import (
	"encoding/json"
	"net/http"

	"github.com/leettomato/quiz/internal/db"
	"github.com/leettomato/quiz/internal/llm"
)

type GradingHandler struct {
	db     *db.DB
	client *llm.Client
}

func NewGradingHandler(db *db.DB, client *llm.Client) *GradingHandler {
	return &GradingHandler{db: db, client: client}
}

type GradeRequest struct {
	ProblemID int    `json:"problem_id"`
	Answer    string `json:"answer"`
}

type GradeResponse struct {
	ProblemID int               `json:"problem_id"`
	Result    *llm.GradingResult `json:"result"`
}

func (h *GradingHandler) Smoke(w http.ResponseWriter, r *http.Request) {
	reply, err := h.client.Ping()
	if err != nil {
		writeJSON(w, map[string]any{"ok": false, "error": err.Error()})
		return
	}
	writeJSON(w, map[string]any{"ok": true, "model_reply": reply})
}

func (h *GradingHandler) Grade(w http.ResponseWriter, r *http.Request) {
	var req GradeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.ProblemID == 0 || req.Answer == "" {
		http.Error(w, "problem_id and answer are required", http.StatusBadRequest)
		return
	}

	problem, err := h.db.GetProblem(req.ProblemID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if problem == nil {
		http.Error(w, "problem not found", http.StatusNotFound)
		return
	}

	result, err := h.client.Grade(problem, req.Answer)
	if err != nil {
		http.Error(w, "grading failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, GradeResponse{
		ProblemID: req.ProblemID,
		Result:    result,
	})
}
