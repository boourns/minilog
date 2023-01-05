package api

import (
	"fmt"
	"github.com/boourns/minilog/lib"
	"net/http"
)

type QueryRequest struct {
	SQL string `json:"sql"`
}

type QueryResponse struct {
	Columns []string   `json:"columns"`
	Rows    [][]string `json:"rows"`
}

func queryEndpoint(w http.ResponseWriter, r *http.Request) {
	var request QueryRequest
	var result QueryResponse

	if !lib.Begin("/api/query", "POST", &request, w, r) {
		return
	}

	rows, err := database.Query(request.SQL)
	if err != nil {
		lib.Error(w, fmt.Sprintf("database error: %s", err), 500)
		return
	}

	defer rows.Close()

	result.Rows = make([][]string, 0)

	if err = rows.Err(); err != nil {
		lib.Error(w, fmt.Sprintf("database error: %v", err), 500)
		return
	}

	result.Columns, err = rows.Columns()
	if err != nil {
		lib.Error(w, fmt.Sprintf("error reading columns: %s", err), 500)
		return
	}

	for rows.Next() {
		var row = make([]string, len(result.Columns))

		var ptrRow = make([]interface{}, len(result.Columns))

		for i, _ := range row {
			ptrRow[i] = &row[i]
		}

		err = rows.Scan(ptrRow...)
		if err != nil {
			lib.Error(w, fmt.Sprintf("error reading row: %s", err), 500)
			return
		}

		result.Rows = append(result.Rows, row)
	}

	lib.RespondWith(true, result, w)
}
