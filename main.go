package main

import (
	"bufio"
	"database/sql"
	"github.com/boourns/dblib"
	_ "github.com/mattn/go-sqlite3"
	"io"
	"log"
	"os"
)

func main() {
	//log.SetLevel(log.DebugLevel)

	db, err := sql.Open("sqlite3", "./minilog.db")
	if err != nil {
		log.Fatal(err)
	}
	err = CreateFieldTable(db)
	if err != nil {
		panic(err)
	}
	err = CreateLogEntryTable(db)
	if err != nil {
		panic(err)
	}

	for true {
		reader := bufio.NewReader(os.Stdin)
		str, err := reader.ReadString('\n')
		if err == io.EOF {
			os.Exit(0)
		}
		if err != nil {
			log.Printf("Error reading string: %v", err)
		}
		log.Printf("Read: %s", str)

		entry, fields, err := ingestJson(str)
		if err != nil {
			log.Printf("Error ingesting: %v", err)
		}

		err = dblib.Transact(db, func(tx *sql.Tx) error {
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

		log.Printf("Ingested entry %v", entry)
	}
}
