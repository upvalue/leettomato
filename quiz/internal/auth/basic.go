package auth

import (
	"crypto/subtle"
	"net/http"
)

// BasicAuth returns middleware that checks HTTP Basic Auth against a single password.
// Username is ignored.
func BasicAuth(password string) func(http.Handler) http.Handler {
	expected := []byte(password)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			_, pass, ok := r.BasicAuth()
			if !ok || subtle.ConstantTimeCompare([]byte(pass), expected) != 1 {
				w.Header().Set("WWW-Authenticate", `Basic realm="leettomato-quiz"`)
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
