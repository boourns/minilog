package main

import (
	"context"
	"database/sql"
	"github.com/go-chi/chi"
	_ "github.com/mattn/go-sqlite3"
	log "github.com/sirupsen/logrus"
	"net/http"
	"os"
	"os/signal"
)

var database *sql.DB

func main() {
	//log.SetLevel(log.DebugLevel)

	filename := "./minilog.db"
	if len(os.Args) > 1 {
		filename = os.Args[1]
	}

	log.Printf("Opening database %s", filename)

	var err error
	database, err = sql.Open("sqlite3", filename)
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

	startIngestServer()
}

func startIngestServer() {
	var srv http.Server

	router := chi.NewRouter()

	router.Handle("/in", http.HandlerFunc(IngestEndpoint))

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

	srv.Addr = ":1112"
	srv.Handler = router

	if err := srv.ListenAndServe(); err != http.ErrServerClosed {
		// Error starting or closing listener:
		log.Fatalf("HTTP server ListenAndServe: %v", err)
	}

	<-idleConnsClosed

}