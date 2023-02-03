import { Component, h } from "preact";
import { Nav } from "react-bootstrap";
import { Query } from "./Query";
import { Console } from "./QueryState";


type QueryConsoleState = {
    selectedQuery?: string
}

export class QueryConsole extends Component<any, QueryConsoleState> {
    rerender(resetQuery: boolean) {
        if (resetQuery) {
            this.setState({selectedQuery: Console.load().queries[0].id})
        } else {
            this.forceUpdate()
        }
    }

    render() {
        let state = Console.load()
        const selected = this.state.selectedQuery ?? state.queries[0].id

        let tabs: h.JSX.Element[] = state.queries.map(q => {
            return <Nav.Item>
                <Nav.Link eventKey={q.id} onClick={() => this.setState({selectedQuery: q.id})}>{q.title}</Nav.Link>
            </Nav.Item>
        })

        tabs.push(<Nav.Item><Nav.Link onClick={() => this.setState({selectedQuery: Console.newQuery()})}>+ Add Query</Nav.Link></Nav.Item>)

        return <><Nav variant="tabs" defaultActiveKey={selected}>
            {tabs}
        </Nav>
        <Query id={selected} rerender={(reset: boolean) => this.rerender(reset)}></Query>
        </>
    }
}