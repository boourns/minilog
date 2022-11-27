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
                    <Navbar.Brand href="#home">Minilog</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="/apps">Applications</Nav.Link>
                        <Nav.Link href="/console">Console</Nav.Link>
                    </Nav>
                </Container>
                </Navbar>

                <main>
                <Container>
                    <Router>
                        <QueryConsole path="/console"></QueryConsole>
                        <Application path="/apps/:appName"></Application>
                        <ApplicationList path="/apps" default></ApplicationList>
                    </Router>
                </Container>
                </main>
            </div>
    }
}