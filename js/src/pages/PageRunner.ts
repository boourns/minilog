import { MinilogAPI } from "../api";

export class PageRunner {
    private code: string;
    function!: Function;
    output: string = "";
    status?: string = "";
    error?: string = "";
    callback: () => void;

    constructor(code: string, callback: () => void) {
        this.code = code;
        this.sql = this.sql.bind(this)
        this.print = this.print.bind(this)
        this.table = this.table.bind(this)
        this.callback = callback
    }

    async run() {
        try {
            this.function = new Function("sql", "print", "table", this.code);
            const f = this.function(this.sql, this.print, this.table);
            await f()
        } catch (e: any) {
            console.error(e)

            this.error = e.toString()
            this.status = "Error occurred: " + e.toString()
            this.callback()
        }
        
    }
    
    async sql(code: string) {
        const api = new MinilogAPI()
        this.updateStatus("Running SQL: " + code)

        const result = await api.query(code)
        this.updateStatus("")
        
        return result
    }

    table(data: any) {
        if (data.rows && data.cols) {
            this.renderTable(data.cols, data.rows)
            return
        } else if (data instanceof Array) {
            this.renderTable(["data"], data.map(d => [d]))
        } else {
            const cols = Object.keys(data)
            const row = []
            for (const c of cols) {
                row.push(data[c])
            }
            this.renderTable(cols, [row])
        }
        
        this.output += "<table>"
        this.output += "<tr>"
        for (const key in data[0]) {
            this.output += "<th>" + key + "</th>"
        }
        this.output += "</tr>"

        for (const row of data) {
            this.output += "<tr>"
            for (const key in row) {
                this.output += "<td>" + row[key] + "</td>"
            }
            this.output += "</tr>"
        }
        this.output += "</table>"
        this.callback()
    }

    print(args: any) {
        debugger

        if (args instanceof Array) {
            args = args.join("\n")
        } else if (args instanceof Object) {
            args = JSON.stringify(args, null, 2)
        }

        this.output += args + "\n"
        this.callback()
    }

    html() {
        return this.output
    }

    updateStatus(status: string) {
        this.status = status
        this.callback()
    }

    renderTable(cols: string[], rows: string[][]) {
        this.output += "<table>"
        this.output += "<tr>"
        for (const col of cols) {
            this.output += "<th>" + col + "</th>"
        }
        this.output += "</tr>"

        for (const row of rows) {
            this.output += "<tr>"
            for (const col of row) {
                this.output += "<td>" + col + "</td>"
            }
            this.output += "</tr>"
        }
        this.output += "</table>"
        this.callback()
    }
}