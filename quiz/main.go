package main

import (
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/leettomato/quiz/internal/auth"
	"github.com/leettomato/quiz/internal/config"
	"github.com/leettomato/quiz/internal/db"
	"github.com/leettomato/quiz/internal/handler"
	"github.com/leettomato/quiz/internal/llm"
)

func main() {
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	switch os.Args[1] {
	case "server":
		runServer()
	case "grade":
		runGrade(os.Args[2:])
	default:
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Fprintln(os.Stderr, "Usage: quiz <command>")
	fmt.Fprintln(os.Stderr, "")
	fmt.Fprintln(os.Stderr, "Commands:")
	fmt.Fprintln(os.Stderr, "  server    Start the web server")
	fmt.Fprintln(os.Stderr, "  grade     Grade an answer via CLI")
}

func runServer() {
	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Config error: %v\n", err)
		os.Exit(1)
	}

	database, err := db.Open(cfg.DBPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Database error: %v\n", err)
		os.Exit(1)
	}
	defer database.Close()

	llmClient := llm.NewClient(cfg.LLMBaseURL, cfg.LLMAPIKey, cfg.LLMModel)

	problemsHandler := handler.NewProblemsHandler(database)
	gradingHandler := handler.NewGradingHandler(database, llmClient)

	mux := http.NewServeMux()

	// API routes
	mux.HandleFunc("GET /api/problems", problemsHandler.List)
	mux.HandleFunc("GET /api/problems/{id}", problemsHandler.Get)
	mux.HandleFunc("GET /api/topics", problemsHandler.Topics)
	mux.HandleFunc("POST /api/grade", gradingHandler.Grade)
	mux.HandleFunc("GET /api/smoke", gradingHandler.Smoke)

	// SPA static files
	mux.Handle("/", handler.SPAHandler(cfg.StaticDir))

	// Wrap with auth
	authed := auth.BasicAuth(cfg.AuthPassword)(mux)

	addr := ":" + cfg.Port
	log.Printf("Starting server on %s", addr)
	if err := http.ListenAndServe(addr, authed); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}

func runGrade(args []string) {
	fs := flag.NewFlagSet("grade", flag.ExitOnError)
	problemSlug := fs.String("problem", "", "Problem slug (e.g., two-sum)")
	problemID := fs.Int("problem-id", 0, "Problem database ID")
	answerFile := fs.String("answer", "", "Path to answer file (reads stdin if omitted)")
	fs.Parse(args)

	if *problemSlug == "" && *problemID == 0 {
		fmt.Fprintln(os.Stderr, "Usage: quiz grade --problem <slug> [--answer <file>]")
		fmt.Fprintln(os.Stderr, "       quiz grade --problem-id <id> [--answer <file>]")
		os.Exit(1)
	}

	cfg := config.LoadForCLI()

	database, err := db.Open(cfg.DBPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error opening database: %v\n", err)
		os.Exit(1)
	}
	defer database.Close()

	var problem *db.Problem
	if *problemID > 0 {
		problem, err = database.GetProblem(*problemID)
	} else {
		problem, err = database.GetProblemBySlug(*problemSlug)
	}
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error fetching problem: %v\n", err)
		os.Exit(1)
	}
	if problem == nil {
		fmt.Fprintln(os.Stderr, "Problem not found")
		os.Exit(1)
	}

	fmt.Fprintf(os.Stderr, "Problem: %s (#%s) [%s]\n", problem.Title, problem.SourceID, problem.Difficulty)
	fmt.Fprintf(os.Stderr, "Topics: %s\n\n", strings.Join(problem.Topics, ", "))

	// Read answer
	var answer string
	if *answerFile != "" {
		data, err := os.ReadFile(*answerFile)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error reading answer file: %v\n", err)
			os.Exit(1)
		}
		answer = string(data)
	} else {
		fmt.Fprintln(os.Stderr, "Reading answer from stdin (Ctrl+D to finish)...")
		data, err := io.ReadAll(os.Stdin)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error reading stdin: %v\n", err)
			os.Exit(1)
		}
		answer = string(data)
	}

	if strings.TrimSpace(answer) == "" {
		fmt.Fprintln(os.Stderr, "Error: empty answer")
		os.Exit(1)
	}

	fmt.Fprintf(os.Stderr, "Grading with %s via %s...\n\n", cfg.LLMModel, cfg.LLMBaseURL)

	client := llm.NewClient(cfg.LLMBaseURL, cfg.LLMAPIKey, cfg.LLMModel)
	result, err := client.Grade(problem, answer)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error grading: %v\n", err)
		os.Exit(1)
	}

	printResult(result)
}

func printResult(r *llm.GradingResult) {
	criteria := []struct {
		name   string
		result llm.CriterionResult
	}{
		{"Pattern Identified", r.PatternIdentified},
		{"Solution Works", r.SolutionWorks},
		{"Complexity Analysis", r.ComplexityAnalysis},
		{"Optimal Solution", r.OptimalSolution},
	}

	score := 0
	for _, c := range criteria {
		icon := "\u2717"
		if c.result.Score {
			icon = "\u2713"
			score++
		}
		fmt.Printf("[%s] %s\n    %s\n\n", icon, c.name, c.result.Comment)
	}

	fmt.Printf("Score: %s/4\n\n", strconv.Itoa(score))
	fmt.Printf("Overall Feedback:\n%s\n", r.OverallFeedback)
}
