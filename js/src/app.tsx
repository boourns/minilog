import { MinilogAPI } from "./api"

console.log("welcome to minilog")


async function attempt() {
    const api = new MinilogAPI()

    let result = await api.query("SELECT * from LogEntry;")

    console.log("Result is ", result)
}

attempt()

