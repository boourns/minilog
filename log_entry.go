package main

import "time"

//go:generate go run github.com/boourns/scaffold model  -config ./scaffold.json
type LogEntry struct {
	ID int64
	LogTime time.Time		`sqlType:"DATETIME"`
	Level string
	Message string
	ContextId string
	ContextType string
}