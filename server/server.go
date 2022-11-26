package main

import (
	"database/sql"
	"github.com/boourns/dblib"
	"github.com/boourns/minilog/cfg"
	"github.com/boourns/minilog/lib"
	"io/ioutil"
	"log"
	"net/http"
)

func IngestEndpoint(w http.ResponseWriter, r *http.Request) {
	if r.Body == nil {
		lib.Error(w, "body expected", 405)
		return
	}

	var key []string
	var ok bool
	if key, ok = r.Header["X-Minilog-Key"]; !ok || len(key) != 1 {
		lib.Error(w, "key expected", 405)
	}

	var application string
	if application, ok = cfg.ApplicationByKey[key[0]]; !ok {
		lib.Error(w, "application not found", 404)
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		lib.Error(w, "Invalid Request", 403)

		return
	}

	entry, fields, err := ingestJson(body)
	entry.Application = application

	err = dblib.Transact(database, func(tx *sql.Tx) error {
		err := entry.Insert(tx)
		if err != nil {
			return err
		}

		for k, v := range fields {
			field := Field{LogEntryID: entry.ID, Key: k, Value: v}
			err := field.Insert(tx)
			if err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		log.Printf("Error inserting log into database: %v", err)
	}
}