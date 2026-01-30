package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/leettomato/quiz/internal/db"
)

type ProblemsHandler struct {
	db *db.DB
}

func NewProblemsHandler(db *db.DB) *ProblemsHandler {
	return &ProblemsHandler{db: db}
}

type ListResponse struct {
	Problems []db.ProblemSummary `json:"problems"`
	Total    int                 `json:"total"`
	Limit    int                 `json:"limit"`
	Offset   int                 `json:"offset"`
}

func (h *ProblemsHandler) List(w http.ResponseWriter, r *http.Request) {
	params := db.ListParams{
		Query:      r.URL.Query().Get("q"),
		Difficulty: r.URL.Query().Get("difficulty"),
		Topic:      r.URL.Query().Get("topic"),
		Limit:      50,
		Offset:     0,
	}

	if v := r.URL.Query().Get("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 200 {
			params.Limit = n
		}
	}
	if v := r.URL.Query().Get("offset"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n >= 0 {
			params.Offset = n
		}
	}

	problems, total, err := h.db.ListProblems(params)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, ListResponse{
		Problems: problems,
		Total:    total,
		Limit:    params.Limit,
		Offset:   params.Offset,
	})
}

func (h *ProblemsHandler) Get(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	problem, err := h.db.GetProblem(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if problem == nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	writeJSON(w, problem)
}

func (h *ProblemsHandler) Topics(w http.ResponseWriter, r *http.Request) {
	topics, err := h.db.ListTopics()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, topics)
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}
