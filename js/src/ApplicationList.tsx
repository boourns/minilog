import { Component } from "preact/compat";
import { Spinner } from "react-bootstrap";
import { MinilogAPI, QueryResult } from "./api";
import {resultTable} from "./ResultTable";

type ApplicationListState = {
    results?: QueryResult
}

export class ApplicationList extends Component<any, ApplicationListState> {
    async componentWillMount() {
        const api = new MinilogAPI()
        let results = await api.query("SELECT DISTINCT Application from LogEntry;")

        this.setState({results})
    }

    render() {
        if (!this.state.results) {
            return <Spinner></Spinner>
        }

        const apps = this.state.results.rows.map(r => <a href={`/admin/apps/${r[0]}`}>{r[0]}</a>)

        return <div>
            <div>Applications</div>
            <div style="display: flex; flex-direction: col;">
                {apps}
            </div>
            
        </div>
    }
}