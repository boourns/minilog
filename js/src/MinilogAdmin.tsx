import { Component } from "preact";
import {Router} from "preact-router";

import { Container, Nav, Navbar } from 'react-bootstrap'
import { Application } from "./Application";
import { ApplicationList } from "./ApplicationList";
import { QueryConsole } from "./QueryConsole";

export class MinilogAdmin extends Component<any, any> {
    render() {
        return <div>
                <Navbar>
                <Container>
                    <Navbar.Brand href="/admin/apps">Minilog</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="/admin/apps">Applications</Nav.Link>
                        <Nav.Link href="/admin/console">Console</Nav.Link>
                    </Nav>
                </Container>
                </Navbar>

                <main>
                <Container>
                    <Router>
                        <QueryConsole path="/admin/console"></QueryConsole>
                        <Application path="/admin/apps/:appName"></Application>
                        <ApplicationList path="/admin/apps" default></ApplicationList>
                    </Router>
                </Container>
                </main>
            </div>
    }
}