package main

import (
	"database/sql"
	"fmt"
	"github.com/boourns/dblib"
)

func sqlFieldsForField() string {
	return "Field.ID,Field.LogEntryID,Field.Key,Field.Value"
}

func loadField(rows *sql.Rows) (*Field, error) {
	ret := Field{}

	err := rows.Scan(&ret.ID, &ret.LogEntryID, &ret.Key, &ret.Value)
	if err != nil {
		return nil, err
	}
	return &ret, nil
}

func SelectField(tx dblib.Queryable, cond string, condFields ...interface{}) ([]*Field, error) {
	ret := []*Field{}
	sql := fmt.Sprintf("SELECT %s from Field %s", sqlFieldsForField(), cond)
	rows, err := tx.Query(sql, condFields...)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		item, err := loadField(rows)
		if err != nil {
			return nil, err
		}
		ret = append(ret, item)
	}
	rows.Close()
	return ret, nil
}

func (s *Field) Update(tx dblib.Queryable) error {
	stmt, err := tx.Prepare("UPDATE Field SET ID=?,LogEntryID=?,Key=?,Value=? WHERE Field.ID = ?")

	if err != nil {
		return err
	}

	params := []interface{}{s.ID, s.LogEntryID, s.Key, s.Value}
	params = append(params, s.ID)

	_, err = stmt.Exec(params...)
	if err != nil {
		return err
	}

	return nil
}

func (s *Field) Insert(tx dblib.Queryable) error {
	stmt, err := tx.Prepare("INSERT INTO Field(LogEntryID,Key,Value) VALUES(?,?,?)")
	if err != nil {
		return err
	}

	result, err := stmt.Exec(s.LogEntryID, s.Key, s.Value)
	if err != nil {
		return err
	}

	s.ID, err = result.LastInsertId()
	if err != nil {
		return err
	}
	return nil
}

func (s *Field) Delete(tx dblib.Queryable) error {
	stmt, err := tx.Prepare("DELETE FROM Field WHERE ID = ?")
	if err != nil {
		return err
	}

	_, err = stmt.Exec(s.ID)
	if err != nil {
		return err
	}

	return nil
}

func CreateFieldTable(tx dblib.Queryable) error {
	stmt, err := tx.Prepare(`



CREATE TABLE IF NOT EXISTS Field (
  
    ID INTEGER PRIMARY KEY,
  
    LogEntryID INTEGER,
  
    Key VARCHAR(255),
  
    Value VARCHAR(255)
  
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
