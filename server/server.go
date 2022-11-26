package main

import (
	"database/sql"
	"encoding/json"
	"github.com/boourns/dblib"
	"github.com/boourns/minilog/lib"
	"io/ioutil"
	"log"
	"net/http"
)

func IngestEndpoint(w http.ResponseWriter, r *http.Request) {
	log.Println("IngestEndpoint")

	if r.Body == nil {
		lib.Error(w, "body expected", 405)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		lib.Error(w, "Invalid Request", 403)

		return
	}

	entry, fields, err := ingestJson(body)

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

type QueryRequest struct {
	q string
}

type QueryResponse struct {

}

func QueryEndpoint(w http.ResponseWriter, r *http.Request) {
	log.Println("IngestEndpoint")

	if r.Body == nil {
		lib.Error(w, "body expected", 405)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		lib.Error(w, "Invalid Request", 403)

		return
	}

	var query QueryRequest
	err = json.Unmarshal(body, &query)
	if err != nil {
		lib.Error(w, "failed to parse json", 403)
	}


}