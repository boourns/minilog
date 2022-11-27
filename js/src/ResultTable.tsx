import { QueryResult } from "./api"

export const resultTable = (results: QueryResult, columns?: string[]) => {
    if (!columns) {
        columns = results.columns
    }

    const columnIndices = columns.map(c => results.columns.findIndex(rc => rc == c))

    const headers = columnIndices.map(i => <th>{results.columns[i]}</th>)

    const rows = results.rows.map(r => {
        const entries = columnIndices.map(i => <td style="padding: 5px;">{r[i]}</td>)

        return <tr>{entries}</tr>
    })

    return <table>
        <tr>
            {headers}
        </tr>
        {rows}
    </table>
}