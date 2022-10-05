package main

import (
	"database/sql"
	"fmt"
	"github.com/boourns/dblib"
)

func sqlFieldsForField() string {
	return "Field.ID,Field.LogEntryID,Field.Message,Field.Key,Field.Value" // ADD FIELD HERE
}

func loadField(rows *sql.Rows) (*Field, error) {
	ret := Field{}

	err := rows.Scan(&ret.ID, &ret.LogEntryID, &ret.Message, &ret.Key, &ret.Value) // ADD FIELD HERE
	if err != nil {
		return nil, err
	}
	return &ret, nil
}

func SelectField(tx dblib.DBLike, cond string, condFields ...interface{}) ([]*Field, error) {
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

func (s *Field) Update(tx dblib.DBLike) error {
	stmt, err := tx.Prepare(fmt.Sprintf("UPDATE Field SET ID=?,LogEntryID=?,Message=?,Key=?,Value=? WHERE Field.ID = ?")) // ADD FIELD HERE

	if err != nil {
		return err
	}

	params := []interface{}{s.ID, s.LogEntryID, s.Message, s.Key, s.Value} // ADD FIELD HERE
	params = append(params, s.ID)

	_, err = stmt.Exec(params...)
	if err != nil {
		return err
	}

	return nil
}

func (s *Field) Insert(tx dblib.DBLike) error {
	stmt, err := tx.Prepare("INSERT INTO Field(LogEntryID,Message,Key,Value) VALUES(?,?,?,?)") // ADD FIELD HERE
	if err != nil {
		return err
	}

	result, err := stmt.Exec(s.LogEntryID, s.Message, s.Key, s.Value) // ADD FIELD HERE
	if err != nil {
		return err
	}

	s.ID, err = result.LastInsertId()
	if err != nil {
		return err
	}
	return nil
}

func (s *Field) Delete(tx dblib.DBLike) error {
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

func CreateFieldTable(tx dblib.DBLike) error {
	stmt, err := tx.Prepare(`



CREATE TABLE IF NOT EXISTS Field (
  
    ID INTEGER PRIMARY KEY,
  
    LogEntryID INTEGER,
  
    Message VARCHAR(255),
  
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
