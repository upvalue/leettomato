package db

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	_ "modernc.org/sqlite"
)

type Problem struct {
	ID             int      `json:"id"`
	Source         string   `json:"source"`
	SourceID       string   `json:"source_id"`
	Slug           string   `json:"slug"`
	Title          string   `json:"title"`
	Difficulty     string   `json:"difficulty"`
	Description    string   `json:"description,omitempty"`
	Examples       []any    `json:"examples,omitempty"`
	Constraints    []string `json:"constraints,omitempty"`
	Hints          []string `json:"hints,omitempty"`
	Python3Snippet string   `json:"python3_snippet,omitempty"`
	Topics         []string `json:"topics"`
}

// ProblemSummary is a lightweight version for list endpoints.
type ProblemSummary struct {
	ID         int      `json:"id"`
	SourceID   string   `json:"source_id"`
	Slug       string   `json:"slug"`
	Title      string   `json:"title"`
	Difficulty string   `json:"difficulty"`
	Topics     []string `json:"topics"`
}

type DB struct {
	conn *sql.DB
}

func Open(path string) (*DB, error) {
	conn, err := sql.Open("sqlite", path+"?_pragma=journal_mode(WAL)&_pragma=foreign_keys(ON)")
	if err != nil {
		return nil, fmt.Errorf("open db: %w", err)
	}
	if err := conn.Ping(); err != nil {
		return nil, fmt.Errorf("ping db: %w", err)
	}
	return &DB{conn: conn}, nil
}

func (d *DB) Close() error {
	return d.conn.Close()
}

type ListParams struct {
	Query      string
	Difficulty string
	Topic      string
	Limit      int
	Offset     int
}

func (d *DB) ListProblems(params ListParams) ([]ProblemSummary, int, error) {
	if params.Limit <= 0 {
		params.Limit = 50
	}

	var where []string
	var args []any

	// Check for #ID search
	if strings.HasPrefix(params.Query, "#") {
		idStr := strings.TrimPrefix(params.Query, "#")
		where = append(where, "p.source_id = ?")
		args = append(args, idStr)
	} else if params.Query != "" {
		where = append(where, "p.id IN (SELECT rowid FROM problems_fts WHERE problems_fts MATCH ?)")
		// FTS5 prefix search
		args = append(args, params.Query+"*")
	}

	if params.Difficulty != "" {
		where = append(where, "p.difficulty = ?")
		args = append(args, params.Difficulty)
	}

	if params.Topic != "" {
		where = append(where, "p.id IN (SELECT pt.problem_id FROM problem_topics pt JOIN topics t ON t.id = pt.topic_id WHERE t.name = ?)")
		args = append(args, params.Topic)
	}

	whereClause := ""
	if len(where) > 0 {
		whereClause = "WHERE " + strings.Join(where, " AND ")
	}

	// Count total
	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM problems p %s", whereClause)
	if err := d.conn.QueryRow(countQuery, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("count problems: %w", err)
	}

	// Fetch page
	query := fmt.Sprintf(`
		SELECT p.id, p.source_id, p.slug, p.title, p.difficulty
		FROM problems p %s
		ORDER BY CAST(p.source_id AS INTEGER)
		LIMIT ? OFFSET ?
	`, whereClause)

	pageArgs := append(args, params.Limit, params.Offset)
	rows, err := d.conn.Query(query, pageArgs...)
	if err != nil {
		return nil, 0, fmt.Errorf("list problems: %w", err)
	}
	defer rows.Close()

	var problems []ProblemSummary
	for rows.Next() {
		var p ProblemSummary
		if err := rows.Scan(&p.ID, &p.SourceID, &p.Slug, &p.Title, &p.Difficulty); err != nil {
			return nil, 0, fmt.Errorf("scan problem: %w", err)
		}
		problems = append(problems, p)
	}

	// Fetch topics for all problems
	if len(problems) > 0 {
		ids := make([]string, len(problems))
		for i, p := range problems {
			ids[i] = fmt.Sprintf("%d", p.ID)
		}
		topicQuery := fmt.Sprintf(`
			SELECT pt.problem_id, t.name
			FROM problem_topics pt
			JOIN topics t ON t.id = pt.topic_id
			WHERE pt.problem_id IN (%s)
		`, strings.Join(ids, ","))

		topicRows, err := d.conn.Query(topicQuery)
		if err != nil {
			return nil, 0, fmt.Errorf("fetch topics: %w", err)
		}
		defer topicRows.Close()

		topicMap := make(map[int][]string)
		for topicRows.Next() {
			var pid int
			var name string
			if err := topicRows.Scan(&pid, &name); err != nil {
				return nil, 0, fmt.Errorf("scan topic: %w", err)
			}
			topicMap[pid] = append(topicMap[pid], name)
		}

		for i := range problems {
			problems[i].Topics = topicMap[problems[i].ID]
			if problems[i].Topics == nil {
				problems[i].Topics = []string{}
			}
		}
	}

	return problems, total, nil
}

func (d *DB) GetProblem(id int) (*Problem, error) {
	var p Problem
	var examplesJSON, constraintsJSON, hintsJSON string

	err := d.conn.QueryRow(`
		SELECT id, source, source_id, slug, title, difficulty, description,
		       examples, constraints, hints, python3_snippet
		FROM problems WHERE id = ?
	`, id).Scan(&p.ID, &p.Source, &p.SourceID, &p.Slug, &p.Title, &p.Difficulty,
		&p.Description, &examplesJSON, &constraintsJSON, &hintsJSON, &p.Python3Snippet)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get problem: %w", err)
	}

	json.Unmarshal([]byte(examplesJSON), &p.Examples)
	json.Unmarshal([]byte(constraintsJSON), &p.Constraints)
	json.Unmarshal([]byte(hintsJSON), &p.Hints)

	// Fetch topics
	rows, err := d.conn.Query(`
		SELECT t.name FROM topics t
		JOIN problem_topics pt ON pt.topic_id = t.id
		WHERE pt.problem_id = ?
	`, id)
	if err != nil {
		return nil, fmt.Errorf("fetch topics: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			return nil, fmt.Errorf("scan topic: %w", err)
		}
		p.Topics = append(p.Topics, name)
	}
	if p.Topics == nil {
		p.Topics = []string{}
	}

	return &p, nil
}

// GetProblemBySlug fetches a problem by its slug.
func (d *DB) GetProblemBySlug(slug string) (*Problem, error) {
	var id int
	err := d.conn.QueryRow("SELECT id FROM problems WHERE slug = ?", slug).Scan(&id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("lookup slug: %w", err)
	}
	return d.GetProblem(id)
}

// ListTopics returns all topic names.
func (d *DB) ListTopics() ([]string, error) {
	rows, err := d.conn.Query("SELECT name FROM topics ORDER BY name")
	if err != nil {
		return nil, fmt.Errorf("list topics: %w", err)
	}
	defer rows.Close()

	var topics []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			return nil, fmt.Errorf("scan topic: %w", err)
		}
		topics = append(topics, name)
	}
	return topics, nil
}
