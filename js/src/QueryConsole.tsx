import { Component } from "preact"
import { Button, Form, Spinner } from "react-bootstrap"
import { MinilogAPI, QueryResult } from "./api"
import { resultTable } from "./ResultTable"

export interface ApplicationProps {
}

type QueryConsoleState = {
    error?: string
    query: string
    results?: QueryResult
}

export class QueryConsole extends Component<ApplicationProps, QueryConsoleState> {
    api: MinilogAPI

    transactions: Map<string, QueryResult>

    constructor() {
        super()
        console.log("do I get here? no.")
        this.api = new MinilogAPI()
        this.transactions = new Map()
        this.state = {
            query: "SELECT * from LogEntry JOIN Field on Field.LogEntryID = LogEntry.ID ORDER BY ID DESC LIMIT 100;"
        }
    }

    componentWillMount(): void {
    }

    queryChanged(e: any) {
        this.setState({query: e.currentTarget.value})
    }

    renderResults() {
        if (!this.state.results) {
            return <div>No results</div>
        } else {
            return resultTable(this.state.results)
        }
    }

    render() {
        return <div style="display: flex; flex-direction: column;">
                <div>SQL Query</div>
                <textarea style="height: 200px; font-family: monospace; font-size: 16; padding: 10px;" value={this.state.query} width={80} height={8} onChange={(e) => this.queryChanged(e)}></textarea>
                <div style="padding-top: 10px; padding-bottom: 10px;">
                    <Button style="margin: auto; padding-top: 10px;" onClick={() => this.runQuery()}>Run Query</Button>
                </div>
            {this.renderResults()}
        </div>
    }

    async runQuery() {
        let results = await this.api.query(this.state.query)
        if (!results) {
            this.setState({error: "no results returned"})
        } else {
            this.setState({results})
        }
    }
}