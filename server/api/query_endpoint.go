package api

import (
	"github.com/boourns/minilog/lib"
	"net/http"
	"log"
)

type QueryRequest struct {
	SQL string `json:"sql"`
}

type QueryResponse struct {
	Columns []string `json:"columns"`
	Rows [][]string `json:"rows"`
}

func queryEndpoint(w http.ResponseWriter, r *http.Request) {
	var request QueryRequest
	var result QueryResponse

	if !lib.Begin("/api/query", "POST", &request, w, r) {
		return
	}

	rows, err := database.Query(request.SQL)
	if err != nil {
		lib.Error(w, "database error", 500)
		return
	}

	result.Rows = make([][]string, 0)

	result.Columns, err = rows.Columns()
	if err != nil {
		lib.Error(w, "error reading columns", 500)
	}

	for rows.Next() {
		var row = make([]string, len(result.Columns))

		var ptrRow = make([]interface{}, len(result.Columns))
		
		for i, _ := range row {
			ptrRow[i] = &row[i]
		}

		rows.Scan(ptrRow...)

		result.Rows = append(result.Rows, row)
	}

	rows.Close()

	lib.RespondWith(true, result, w)
}