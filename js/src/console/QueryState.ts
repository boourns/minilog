import { QueryResult } from "../api"
import { token } from "./util"

export type StoredQuery = {
    id: string
    title: string
    sql: string
}

export type ConsoleState = {
    queries: StoredQuery[]
    selectedQuery: string
}

const CONSOLE_STATE_KEY = "console-state"

export class Console {
    static load(): ConsoleState {
        let saved = localStorage.getItem(CONSOLE_STATE_KEY)
        if (saved) {
            return JSON.parse(saved)
        } else {
            let id = token()
            let data: ConsoleState = {
                queries: [
                    {
                        id,
                        title: "Last 100 Logs",
                        sql: "SELECT * from LogEntry JOIN Field on Field.LogEntryID = LogEntry.ID ORDER BY ID DESC LIMIT 100;"
                    }
                ],
                selectedQuery: id
            }
            Console.store(data)
            return data
        }
    }

    static store(data: ConsoleState) {
        localStorage.setItem(CONSOLE_STATE_KEY, JSON.stringify(data))
    }

    static save(query: StoredQuery) {
        let state = Console.load()

        let existingIndex = state.queries.findIndex(q => q.id == query.id)
        if (existingIndex == -1) {
            state.queries.push(query)
        } else {
            state.queries[existingIndex] = query
        }

        Console.store(state)
    }

    static delete(id: string) {
        let state = Console.load()

        state.queries = state.queries.filter(q => q.id != id)

        Console.store(state)
        if (state.queries.length == 0) {
            Console.newQuery()
        }
    }

    static newQuery(id?: string): string {
        let data = Console.load()
        if (!id) {
            id = token()
        }

        data.queries.push({
            id,
            title: "New Query",
            sql: "SELECT * from LogEntry JOIN Field on Field.LogEntryID = LogEntry.ID ORDER BY ID DESC LIMIT 100;"
        })
        data.selectedQuery = id

        Console.store(data)

        return id
    }

    static query(id: string): StoredQuery | undefined {
        let data = Console.load()
        let query = data.queries.filter(q => q.id == id)
        return query[0]
    }
}