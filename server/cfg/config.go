package cfg

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

type Application struct {
	Name string `json:"name"`
	Key string `json:"key"`
}

type ConfigFile struct {
	Bind string `json:"bind"`
	Database string `json:"database"`
	CSRFSecret string `json:"csrfSecret"`
	Applications []Application `json:"applications"`
}

var Config ConfigFile
var Environment string
var ApplicationByKey map[string]string

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

	ApplicationByKey = make(map[string]string, 0)

	for _, app := range Config.Applications {
		ApplicationByKey[app.Key] = app.Name
	}

	return Config
}

func Production() bool {
	return Environment == "production"
}

func Development() bool {
	return Environment == "development"
}