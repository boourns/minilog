import { token } from "../console/util"

export type StoredPage = {
    id: string
    title: string
    code: string
}

export type PageState = {
    pages: StoredPage[]
}

const PAGE_STATE_KEY = "pages-state"

export class Pages {
    static load(): PageState {
        let saved = localStorage.getItem(PAGE_STATE_KEY)
        if (saved) {
            return JSON.parse(saved) as PageState
        } else {
            let id = token()

            let data: PageState = {
                pages: [
                    {
                        id,
                        title: "Funnel Example",
                        code: "asdf"
                    }
                ],
            }
            Pages.store(data)
            return data
        }
    }

    static store(data: PageState) {
        localStorage.setItem(PAGE_STATE_KEY, JSON.stringify(data))
    }
}