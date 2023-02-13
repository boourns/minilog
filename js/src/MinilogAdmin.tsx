import { Component } from "preact";
import {Router} from "preact-router";

import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { Application } from "./Application";
import { ApplicationList } from "./ApplicationList";
import { QueryConsole } from "./console/QueryConsole";
import { Query } from "./console/Query";
import { Pages } from "./pages/Pages";
import { token } from "./console/util";
import { PageView } from "./pages/Page";

export class MinilogAdmin extends Component<any, any> {
    newPage() {
        const id = token()
        let pages = Pages.load()
        pages.pages.push({
            id,
            title: "New Page",
            code: ""
        })

        Pages.store(pages)
        document.location = `/admin/pages/${id}`
    }

    render() {
        let pages = Pages.load().pages.map(p => 
            <NavDropdown.Item href={`/admin/pages/${p.id}`}>{p.title}</NavDropdown.Item>
        )

        pages.push(<NavDropdown.Divider></NavDropdown.Divider>)
        pages.push(<NavDropdown.Item onClick={() => this.newPage()}>New Page</NavDropdown.Item>)

        return <div>
                <Navbar>
                <Container>
                    <Navbar.Brand href="/admin/apps">Minilog</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="/admin/apps">Applications</Nav.Link>
                        <Nav.Link href="/admin/console">Console</Nav.Link>
                        <NavDropdown title="Pages" id="pages-nav-dropdown">
                            {pages}
                        </NavDropdown>
                    </Nav>
                </Container>
                </Navbar>

                <main>
                <Container>
                    <Router>
                        <QueryConsole path="/admin/console"></QueryConsole>
                        <Application path="/admin/apps/:appName"></Application>
                        <PageView path="/admin/pages/:id"></PageView>
                        <ApplicationList path="/admin/apps" default></ApplicationList>

                    </Router>
                </Container>
                </main>
            </div>
    }
}