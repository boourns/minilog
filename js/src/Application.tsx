import { Component } from "preact"
import { Form, Spinner } from "react-bootstrap"
import { MinilogAPI, QueryResult } from "./api"
import { resultTable } from "./ResultTable"

export interface ApplicationProps {
    appName?: string
}

type ApplicationState = {
    error?: string
    contextQuery?: QueryResult
}

export class Application extends Component<ApplicationProps, ApplicationState> {
    api: MinilogAPI

    transactions: Map<string, QueryResult>

    constructor() {
        super()
        this.api = new MinilogAPI()
        this.transactions = new Map()
    }

    componentWillMount(): void {
        this.queryAll()
    }

    render() {
        if (!this.props.appName || this.props.appName == "") {
            return <div>App name missing</div>
        }

        if (!this.state.contextQuery) {
            return <Spinner></Spinner>
        }

        let transactions = this.state.contextQuery.rows.map(r => {
            let inner
            const tra = this.transactions.get(r[0])
            if (tra) {
                inner = resultTable(tra, ["LogTime", "Level", "Message"])
            } else {
                inner = <Spinner></Spinner>
            }
            return <div style="border: 1px solid black;">
                {inner}
            </div>
        })

        return <div>
            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Search Query</Form.Label>
                <Form.Control type="search" placeholder="" />
            </Form.Group>

            {this.props.appName}
            {transactions}
        </div>
    }

    async queryAll() {
        const sql = `SELECT DISTINCT ContextID from LogEntry WHERE Application="${this.props.appName}" LIMIT 100;`

        let result = await this.api.query(sql)
        if (!result) {
            this.setState({error: "Failed to fetch latest transactions"})
            return
        }

        this.setState({contextQuery: result})
        result.rows.forEach(r => {
            this.queryTransaction(r[0])
        })
    }

    async queryTransaction(context: string) {
        const sql = `SELECT * from LogEntry WHERE ContextID="${context}" ORDER BY ID ASC;`

        let result = await this.api.query(sql)
        if (!result) {
            this.setState({error: `Failed to fetch rows for context ${context}`})
            return
        }
        this.transactions.set(context, result)
        this.forceUpdate()
    }
}