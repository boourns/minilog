package main

import (
	"database/sql"
	"fmt"
	"github.com/boourns/dblib"
)

func sqlFieldsForLogEntry() string {
	return "LogEntry.ID,LogEntry.LogTime,LogEntry.Level,LogEntry.Message,LogEntry.ContextId,LogEntry.ContextType" // ADD FIELD HERE
}

func loadLogEntry(rows *sql.Rows) (*LogEntry, error) {
	ret := LogEntry{}

	err := rows.Scan(&ret.ID, &ret.LogTime, &ret.Level, &ret.Message, &ret.ContextId, &ret.ContextType) // ADD FIELD HERE
	if err != nil {
		return nil, err
	}
	return &ret, nil
}

func SelectLogEntry(tx dblib.DBLike, cond string, condFields ...interface{}) ([]*LogEntry, error) {
	ret := []*LogEntry{}
	sql := fmt.Sprintf("SELECT %s from LogEntry %s", sqlFieldsForLogEntry(), cond)
	rows, err := tx.Query(sql, condFields...)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		item, err := loadLogEntry(rows)
		if err != nil {
			return nil, err
		}
		ret = append(ret, item)
	}
	rows.Close()
	return ret, nil
}

func (s *LogEntry) Update(tx dblib.DBLike) error {
	stmt, err := tx.Prepare(fmt.Sprintf("UPDATE LogEntry SET ID=?,LogTime=?,Level=?,Message=?,ContextId=?,ContextType=? WHERE LogEntry.ID = ?")) // ADD FIELD HERE

	if err != nil {
		return err
	}

	params := []interface{}{s.ID, s.LogTime, s.Level, s.Message, s.ContextId, s.ContextType} // ADD FIELD HERE
	params = append(params, s.ID)

	_, err = stmt.Exec(params...)
	if err != nil {
		return err
	}

	return nil
}

func (s *LogEntry) Insert(tx dblib.DBLike) error {
	stmt, err := tx.Prepare("INSERT INTO LogEntry(LogTime,Level,Message,ContextId,ContextType) VALUES(?,?,?,?,?)") // ADD FIELD HERE
	if err != nil {
		return err
	}

	result, err := stmt.Exec(s.LogTime, s.Level, s.Message, s.ContextId, s.ContextType) // ADD FIELD HERE
	if err != nil {
		return err
	}

	s.ID, err = result.LastInsertId()
	if err != nil {
		return err
	}
	return nil
}

func (s *LogEntry) Delete(tx dblib.DBLike) error {
	stmt, err := tx.Prepare("DELETE FROM LogEntry WHERE ID = ?")
	if err != nil {
		return err
	}

	_, err = stmt.Exec(s.ID)
	if err != nil {
		return err
	}

	return nil
}

func CreateLogEntryTable(tx dblib.DBLike) error {
	stmt, err := tx.Prepare(`



CREATE TABLE IF NOT EXISTS LogEntry (
  
    ID INTEGER PRIMARY KEY,
  
    LogTime DATETIME,
  
    Level VARCHAR(255),
  
    Message VARCHAR(255),
  
    ContextId VARCHAR(255),
  
    ContextType VARCHAR(255)
  
);

`)
	if err != nil {
		return err
	}

	_, err = stmt.Exec()
	if err != nil {
		return err
	}
	return nil
}
