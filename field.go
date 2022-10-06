package main

//go:generate go run github.com/boourns/scaffold model  -config ./scaffold.json
type Field struct {
	ID int64
	LogEntryID int64
	Key string
	Value string
}