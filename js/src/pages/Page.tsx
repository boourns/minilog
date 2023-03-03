import { Component } from "preact";
import { Button } from "react-bootstrap";
import style from "./Page.module.scss"
import { PageRunner } from "./PageRunner";
import { Pages, PageState, StoredPage } from "./Pages";

import loader from '@monaco-editor/loader';

interface PageViewProps {
    path: string
    id?: string
}

type PageViewState = {
    title: string
    modified: boolean
    error?: string
}

export class PageView extends Component<PageViewProps, PageViewState> {
    monaco: any;
    editorElement?: HTMLDivElement;
    editor?: any
    private _monacoChangeHandler: any;

    constructor(props: PageViewProps) {
        super(props);

        this.resizeMouseDown = this.resizeMouseDown.bind(this);
        this.resizeMouseMove = this.resizeMouseMove.bind(this);
    }

    getPage(id: string): StoredPage | undefined {
        const pages = Pages.load()
        const page = pages.pages.find(p => p.id === id)

        if (page == null) {
            this.setState({
                error: "Page not found"
            })
            return
        }

        return page
    }

    async componentWillMount() {
        const page = this.getPage(this.props.id!)

        if (page == undefined) {
            return
        }

        this.setState({
            title: page.title,
            modified: false
        })

        this.monaco = await loader.init()

        this.createEditor(page.code)
    }

    async componentWillReceiveProps(nextProps: Readonly<PageViewProps>, nextContext: any) {
        console.log("componentWillReceiveProps")

        const page = this.getPage(nextProps.id!)
        if (page == undefined) {
            return
        }

        this.setState({
            title: page.title,
            modified: false
        })

        if (this.editor != undefined) {
            this.editor.getModel()!.setValue(page.code)
        } else {
            this.createEditor(page.code)
        }
    }

    setup(ref: HTMLDivElement | null) {
        const page = this.getPage(this.props.id!)

        if (page == undefined || ref == null || this.editorElement != undefined || ref == this.editorElement) {
            return
        }

        this.editorElement = ref;

        this.createEditor(page.code);
    }

    createEditor(initialCode: string) {
        if (this.editorElement == undefined || this.monaco == undefined) {
            return
        }

        this.editor = this.monaco.editor.create(this.editorElement, {
            value: initialCode,
            language: 'javascript',
        });

        const model = this.editor.getModel()!

        this._monacoChangeHandler = model.onDidChangeContent((event: any) => {
            this.setState({
                modified: true
            })
        })
    }

    resizeMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        document.addEventListener("mousemove", this.resizeMouseMove);
        document.addEventListener("mouseup", this.resizeMouseUp);
    }

    resizeMouseMove = (e: MouseEvent) => {
        console.log("resizeMouseMove")

        e.preventDefault();
        const container = document.getElementById("container");
        const preview = document.getElementById("preview");
        const code = document.getElementById("code");

        if (container == null || code == null || preview == null) {
            return
        }

        const codeWidth = e.clientX - container.offsetLeft;

        code.style.flex = `1 1 ${codeWidth}px`;
        preview.style.flex = `1 1 ${container.offsetWidth - codeWidth}px`;
        preview.style.maxWidth = `${container.offsetWidth - codeWidth}px`;
    }

    resizeMouseUp = (e: MouseEvent) => {
        e.preventDefault();

        document.removeEventListener("mousemove", this.resizeMouseMove);
        document.removeEventListener("mouseup", this.resizeMouseUp);
    }

    titleChanged = (e: Event) => {
        this.setState({
            title: (e.target as HTMLInputElement).value,
            modified: true
        })
    }

    saveClicked = () => {
        const pages = Pages.load()
        const index = pages.pages.findIndex(p => p.id === this.props.id)

        if (index == -1) {
            return
        }

        pages.pages[index].title = this.state.title
        pages.pages[index].code = this.editor.getValue()

        Pages.store(pages)
        this.setState({
            modified: false
        })
    }

    runClicked = async () => {
        const preview = document.getElementById("preview")
        if (!preview) {
            return
        }

        const code = this.editor.getValue()

        const runner = new PageRunner(code, () => {
            preview.innerHTML = runner.html() + "<br/>" + `<i>${runner.status}</i>`
        })

        await runner.run()

        preview.innerHTML = runner.html()
    }

    // create two columns, resizeable and draggable
    render() {
        const page = this.page()
        if (!page) {
            return <div>Page not found</div>
        }

        return <div>
            <input type="text" value={this.state.title} onChange={(e) => this.titleChanged(e)}/>
            <Button variant="danger" onClick={() => this.saveClicked()} disabled={!this.state.modified}>Save</Button>
            <Button onClick={() => this.runClicked()}>Run</Button>

            <div id="container" class={style.container}>
                <div id="code" class={style.code} style="height: 600px; width: 100%;" ref={(ref) => this.setup(ref)}></div>
                <div id="resize" class={style["resize-handle"]} onMouseDown={(e) => this.resizeMouseDown(e)}></div>
                <div id="preview" class={style.preview}>
            </div>
      </div>
      </div>
    }


    page(): StoredPage | undefined {
        return Pages.load().pages.find(p => p.id === this.props.id)
    }
}