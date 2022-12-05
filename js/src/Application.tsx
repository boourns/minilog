import { Component } from "preact"
import { Form, Spinner } from "react-bootstrap"
import Plot from 'react-plotly.js'

import { MinilogAPI, QueryResult } from "./api"
import { resultTable } from "./ResultTable"

export interface ApplicationProps {
    appName?: string
}

type ApplicationState = {
    error?: string
    contextQuery?: QueryResult
    graphQuery?: QueryResult
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
        this.queryGraph()
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

        const layout = {
            title: 'Bar Chart',
            xaxis: {
              title: 'Categories'
            },
            yaxis: {
              title: 'Values'
            }
          };
        let chart
        if (this.state.graphQuery) {
            chart = <Plot
            data={[
              {
                x: this.state.graphQuery.rows[0],
                y: this.state.graphQuery.rows[1],
                type: 'bar',
              },
            ]}
            layout={{
                title:"Log Entries (last hour)",
                xaxis: {
                    title:"time",
                },
                yaxis: {
                    title:"count"
                }
            }}
            style={{ width: '100%', height: 400 }}
            config={{ displayModeBar: false }}
            />
        } else {
            chart = <Spinner></Spinner>
        }

        return <div style="display: flex; flex-direction: column;">
            {this.props.appName}
            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Search Query</Form.Label>
                <Form.Control type="search" placeholder="" />
            </Form.Group>
            {chart}
            {transactions}
        </div>
    }

    async queryGraph() {
        const graphSql=`SELECT 
  strftime('%Y-%m-%d %H:%M:%S', COALESCE(CAST(strftime('%s', LogTime) / 300 AS INTEGER), 'N/A') * 300, 'unixepoch') AS bucket,
  COUNT(*) AS count
FROM LogEntry
WHERE LogTime >= datetime('now', '-1 hour')
GROUP BY bucket
ORDER BY bucket ASC`

        let result = await this.api.query(graphSql)

        if (!result) {
            this.setState({error: "Failed to fetch latest graph data"})
            return
        }

        this.setState({graphQuery: result})
    }

    async queryAll() {
        const sql = `SELECT DISTINCT ContextID from LogEntry WHERE Application="${this.props.appName}" AND LogTime >= datetime('now', '-1 hour');`

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