package api

import (
	"database/sql"
	"fmt"
	"github.com/boourns/minilog/cfg"
	"github.com/boourns/minilog/lib"
	"github.com/go-chi/chi"
	"github.com/gorilla/csrf"
	log "github.com/sirupsen/logrus"
	"net/http"
)

type CSRFResponse struct {
	Token string `json:"token"`
}

var database *sql.DB

func Register(router chi.Router) {
	var err error
	database, err = sql.Open("sqlite3", fmt.Sprintf("%s?mode=ro", cfg.Config.Database))
	if err != nil {
		panic(err)
	}

	sameSite := csrf.SameSiteNoneMode
	if cfg.Production() {
		sameSite = csrf.SameSiteStrictMode
	}

	csrfMiddleware := csrf.Protect([]byte(cfg.Config.CSRFSecret), csrf.SameSite(sameSite), csrf.Secure(false))

	router.Use(csrfMiddleware)

	router.HandleFunc("/csrf", func(w http.ResponseWriter, r *http.Request) {
		response := CSRFResponse{Token: csrf.Token(r)}

		err := lib.RespondWith(true, response, w)

		if err != nil {
			log.Errorf("RespondWith failed: %v", err)
		}
	})

	router.HandleFunc("/query", queryEndpoint)
}
