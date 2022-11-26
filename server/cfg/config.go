package cfg

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

type ConfigFile struct {
	Bind string `json:"bind"`
	Database string `json:"database"`
	CSRFSecret string `json:"csrfSecret"`
}

var Config ConfigFile
var Environment string

func ReadConfig() ConfigFile {
	Environment = "development"
	if os.Getenv("MINILOG_ENV") == "production" {
		Environment = "production"
	}

	data, err := ioutil.ReadFile(fmt.Sprintf("./config/%s.json", Environment))

	if err != nil {
		panic(err)
	}

	err = json.Unmarshal(data, &Config)
	if err != nil {
		panic(err)
	}

	return Config
}

func Production() bool {
	return Environment == "production"
}

func Development() bool {
	return Environment == "development"
}