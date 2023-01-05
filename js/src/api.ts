export type QueryResult = {
    errors: {message: string}[]
    columns: string[]
    rows: string[][]
}

export class MinilogAPI {
    static csrfToken?: string

    constructor() {

    }

    async query(sql: string): Promise<QueryResult | undefined> {
        let request = { sql }

        try {
            const response = await this.fetch("/api/query", {
                method: 'POST',
                body: JSON.stringify(request)
            })
            const data = await response.text()
            console.debug("--- query response:")
            console.debug(data)
            return (JSON.parse(data) as QueryResult)
        } catch (error) {
            console.error('query API Error:', error)
        }
    }

    async fetch(input: RequestInfo, init?: RequestInit | undefined, retry: boolean = true): Promise<Response> {
        try {
            if (!MinilogAPI.csrfToken) {
                await this.getCSRF()
            }

            let result = await fetch(input, {
                ...this.fetchOptions(),
                ...init
            })

            this.copyCSRFToken(result.headers)

            return result
        }
        catch (e) {
            if (retry) {
                MinilogAPI.csrfToken = undefined
                return await this.fetch(input, init, false)
            } else {
                debugger

                console.log("HERE?!")
                throw e
            }
        }
    }

    async getCSRF() {
        if (MinilogAPI.csrfToken) {
            return
        }

        let response = await fetch("/api/csrf", this.fetchOptions())
        let data = await response.json()

        if (response.ok) {
            MinilogAPI.csrfToken = data.token
        }
    }

    copyCSRFToken(headers: Headers) {
        const token = headers.get("x-csrf-token")

        MinilogAPI.csrfToken = token ? token : undefined
    }

    fetchOptions(): any {
        let headers: Record<string, string> = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

        if (MinilogAPI.csrfToken) {
            headers["X-CSRF-Token"] = MinilogAPI.csrfToken
        }

        return {
            mode: "cors",
            cache: "no-cache",
            credentials: "include",
            redirect: "error",
            referrerPolicy: "strict-origin",
            headers
        }
    }
}