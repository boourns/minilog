package lib

import (
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"net/http"
)

func Begin(path string, method string, data interface{}, w http.ResponseWriter, r *http.Request) bool {
	if r.URL.Path != path {
		Error(w, "Not found", 404)
		return false
	}

	if r.Method != method {
		Error(w, "Method not allowed", 405)
		return false
	}

	if data != nil {
		if r.Body == nil {
			Error(w, "Body expected", 405)
			return false
		}
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			Error(w, "Invalid Request", 403)
			log.Errorf("Error reading body: %v", err)

			return false
		}

		if path != "/api/login" && path != "/api/signup" && path != "/api/user/password" {
			log.Tracef("HTTP Request Body %s", body)
		}

		err = json.Unmarshal(body, data)
		if err != nil {
			Error(w, "Invalid Request", 403)
			log.Errorf("Error parsing body: %v", err)
			return false
		}
	}

	return true
}

func Error(w http.ResponseWriter, message string, code int) {
	RespondWithCode(code, BaseResponse{OK: false, Code: code, Errors: []ResponseError{{Error: message}}}, w)
}

func RespondWith(success bool, data interface{}, w http.ResponseWriter) error {
	if !success {
		return RespondWithCode(400, data, w)
	} else {
		return RespondWithCode(200, data, w)
	}
}

func RespondWithCode(code int, data interface{}, w http.ResponseWriter) error {
	w.WriteHeader(code)

	body, err := json.Marshal(data)
	if err == nil {
		_, err = w.Write(body)
	}
	return err
}
type BaseResponse struct {
	OK     bool            `json:"ok"`
	Code   int             `json:"status"`
	Errors []ResponseError `json:"errors"`
}

type ResponseError struct {
	Error string `json:"message"`
	Field string `json:"field"`
}