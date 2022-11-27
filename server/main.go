package main

import (
	"context"
	"database/sql"
	"github.com/boourns/minilog/api"
	"github.com/boourns/minilog/cfg"
	"github.com/go-chi/chi"
	_ "github.com/mattn/go-sqlite3"
	log "github.com/sirupsen/logrus"
	"net/http"
	"os"
	"os/signal"
)

var database *sql.DB

func main() {
	cfg.ReadConfig()

	log.Printf("Loaded keys for %d applications", len(cfg.Config.Applications))
	log.Printf("Opening database %s", cfg.Config.Database)

	var err error
	database, err = sql.Open("sqlite3", cfg.Config.Database)
	if err != nil {
		log.Fatal(err)
	}

	err = CreateFieldTable(database)
	if err != nil {
		panic(err)
	}
	err = CreateLogEntryTable(database)
	if err != nil {
		panic(err)
	}

	var srv http.Server

	router := chi.NewRouter()

	startAdminServer(router)

	startIngestServer(router)

	idleConnsClosed := make(chan struct{})
	go func() {
		sigint := make(chan os.Signal, 1)
		signal.Notify(sigint, os.Interrupt)
		<-sigint

		// We received an interrupt signal, shut down.
		if err := srv.Shutdown(context.Background()); err != nil {
			// Error from closing listeners, or context timeout:
			log.Infof("HTTP server Shutdown: %v", err)
		}
		close(idleConnsClosed)
	}()

	log.Printf("Binding to %s", cfg.Config.Bind)
	srv.Addr = cfg.Config.Bind
	srv.Handler = router

	if err := srv.ListenAndServe(); err != http.ErrServerClosed {
		// Error starting or closing listener:
		log.Fatalf("HTTP server ListenAndServe: %v", err)
	}

	<-idleConnsClosed
}

func startIngestServer(router chi.Router) {
	router.Handle("/in", http.HandlerFunc(IngestEndpoint))
}

func startAdminServer(router chi.Router) {
	initAuth(router, cfg.Config.GithubKey, cfg.Config.GithubSecret, cfg.Config.GithubCallbackURL)

	router.HandleFunc("/static/*", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./" + r.URL.Path)
		//w.Header().Set("Content-Type", "text/css")
	})

	router.Route("/admin", func(router chi.Router) {
		router.Use(Protect(true))

		router.Get("/apps", func(w http.ResponseWriter, r *http.Request) {
			http.ServeFile(w, r, "./static/index.html")
		})

		router.NotFound(func(w http.ResponseWriter, r *http.Request) {
			http.ServeFile(w, r, "./static/index.html")
		})
	})

	router.Route("/api", func(router chi.Router) {
		router.Use(Protect(false))

		api.Register(router)
	})
}