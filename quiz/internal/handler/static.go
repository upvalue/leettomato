package handler

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// SPAHandler serves static files and falls back to index.html for SPA routing.
func SPAHandler(staticDir string) http.Handler {
	fileServer := http.FileServer(http.Dir(staticDir))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Clean the path
		path := filepath.Clean(r.URL.Path)
		if path == "." {
			path = "/"
		}

		// Don't serve API routes
		if strings.HasPrefix(path, "/api/") {
			http.NotFound(w, r)
			return
		}

		// Check if file exists on disk
		fullPath := filepath.Join(staticDir, path)
		if _, err := os.Stat(fullPath); err == nil {
			fileServer.ServeHTTP(w, r)
			return
		}

		// Fallback to index.html for SPA routing
		http.ServeFile(w, r, filepath.Join(staticDir, "index.html"))
	})
}
