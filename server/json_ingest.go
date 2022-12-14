package main

import (
	"encoding/json"
	"fmt"
	"time"
)

func readString(key string, rawLog map[string]interface{}) string {
	value := ""
	contextPtr, ok := rawLog[key]
	if ok {
		value, ok = contextPtr.(string)
		if !ok {
			value = ""
		}
		delete(rawLog, key)
	}

	return value
}

func ingestJson(line []byte) (*LogEntry, map[string]string, error) {
	var rawLog map[string]interface{}

	err := json.Unmarshal(line, &rawLog)
	if err != nil {
		// failed to parse, return a dummy parsed entry
		result := LogEntry{
			LogTime: time.Now(),
			ContextId: "",
			ContextType: "",
		}

		return &result, map[string]string{"msg": string(line)}, nil
	}

	// Extract time (default: now)
	logTime := time.Now()
	timePtr, ok := rawLog["time"]
	if ok {
		timeStr, ok := timePtr.(string)
		if ok {
			logTime, _ = time.Parse(time.RFC3339, timeStr)
		}
		delete(rawLog, "time")
	}

	contextId := readString("context_id", rawLog)
	contextType := readString("context_type", rawLog)
	message := readString("msg", rawLog)
	level := readString("level", rawLog)

	var result LogEntry
	result.LogTime = logTime
	result.ContextId = contextId
	result.ContextType = contextType
	result.Message = message
	result.Level = level
	fields := make(map[string]string)

	for k, v := range rawLog {
		fields[k] = fmt.Sprintf("%v", v)
	}

	return &result, fields, nil
}