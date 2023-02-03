import { Component } from "preact"
import { Alert, Button, Form, Spinner } from "react-bootstrap"
import { MinilogAPI, QueryResult } from "../api"
import { resultTable } from "../ResultTable"
import { Console, StoredQuery } from "./QueryState"

export interface QueryProps {
    id: string
    rerender: (resetSelected: boolean) => void
}

type QueryState = {
    error?: string
    query?: StoredQuery
    results?: QueryResult
}

export class Query extends Component<QueryProps, QueryState> {
    api: MinilogAPI

    transactions: Map<string, QueryResult>
    modified: boolean

    constructor() {
        super()

        this.api = new MinilogAPI()
        this.transactions = new Map()
        this.modified = false
    }

    componentWillMount() {
        this.setState({query: Console.query(this.props.id)})
    }

    componentWillReceiveProps(nextProps: Readonly<QueryProps>, nextContext: any): void {
        if (this.modified) {
            let save = window.confirm("Save changes?")
            if (this.state.query && save) {
                Console.save(this.state.query)
            }
        }

        if (nextProps.id != this.state.query?.id) {
            this.setState({query: Console.query(nextProps.id)})
        }
    }

    titleChanged(e: any) {
        let query = {...this.state.query!}
        query.title = e.currentTarget.value

        this.modified = true
        this.setState({query})
    }

    queryChanged(e: any) {
        let query = {...this.state.query!}
        query.sql = e.currentTarget.value

        this.modified = true
        this.setState({query})
    }

    saveClicked() {
        if (!this.state.query) {
            return
        }

        Console.save(this.state.query)

        this.modified = false

        this.props.rerender(false)
    }

    deleteClicked() {
        if (!this.state.query) {
            return
        }

        if (window.confirm("Delete query?")) {
            Console.delete(this.state.query.id)

            this.props.rerender(true)
        }
    }

    renderResults() {
        if (!this.state.results) {
            return <div>No results</div>
        } else {
            if (this.state.results.errors && this.state.results.errors.length > 0) {
                return <Alert variant="danger">{this.state.results.errors.map(e => e.message).join(", ")}</Alert>
            } else {
                return resultTable(this.state.results)
            }
        }
    }

    render() {
        if (!this.state.query) {
            return <div>Query not found</div>
        }

        return <div style="display: flex; flex-direction: column;">
                <div>Query Name</div>
                <input type="text" onChange={(e) => this.titleChanged(e)} value={this.state.query.title}></input>
                <div>SQL Query</div>
                <textarea style="height: 200px; font-family: monospace; font-size: 16; padding: 10px;" value={this.state.query.sql} width={80} height={8} onChange={(e) => this.queryChanged(e)}></textarea>
                
                <div style="padding-top: 10px; padding-bottom: 10px;">
                    <Button style="margin: 5px; padding-top: 10px;" onClick={() => this.runQuery()}>Run Query</Button>
                    <Button style="margin: 5px; padding-top: 10px;" onClick={() => this.saveClicked()} disabled={!this.modified}>Save</Button>
                    <Button style="margin: 5px; padding-top: 10px;" variant="danger" onClick={() => this.deleteClicked()}>Delete Query</Button>
                </div>

            {this.renderResults()}
        </div>
    }

    async runQuery() {
        let results = await this.api.query(this.state.query!.sql)
        if (!results) {
            this.setState({error: "no results returned"})
        } else {
            this.setState({results})
        }
    }
}