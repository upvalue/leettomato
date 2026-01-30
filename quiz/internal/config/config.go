package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port         string
	AuthPassword string
	DBPath       string
	StaticDir    string
	LLMBaseURL   string
	LLMAPIKey    string
	LLMModel     string
}

func Load() (*Config, error) {
	// Load .env file if it exists (ignore error if missing)
	godotenv.Load()

	cfg := &Config{
		Port:         getEnv("PORT", "8080"),
		AuthPassword: os.Getenv("AUTH_PASSWORD"),
		DBPath:       getEnv("DB_PATH", "./problems.db"),
		StaticDir:    getEnv("STATIC_DIR", "./frontend/dist"),
		LLMBaseURL:   getEnv("LLM_BASE_URL", "http://svc-litellm:4000/v1"),
		LLMAPIKey:    os.Getenv("LLM_API_KEY"),
		LLMModel:     getEnv("LLM_MODEL", "claude-sonnet-4-5"),
	}

	if cfg.AuthPassword == "" {
		return nil, fmt.Errorf("AUTH_PASSWORD is required")
	}

	return cfg, nil
}

// LoadForCLI loads config without requiring AUTH_PASSWORD.
func LoadForCLI() *Config {
	godotenv.Load()

	return &Config{
		Port:         getEnv("PORT", "8080"),
		AuthPassword: os.Getenv("AUTH_PASSWORD"),
		DBPath:       getEnv("DB_PATH", "./problems.db"),
		StaticDir:    getEnv("STATIC_DIR", "./frontend/dist"),
		LLMBaseURL:   getEnv("LLM_BASE_URL", "http://svc-litellm:4000/v1"),
		LLMAPIKey:    os.Getenv("LLM_API_KEY"),
		LLMModel:     getEnv("LLM_MODEL", "claude-sonnet-4-5"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
