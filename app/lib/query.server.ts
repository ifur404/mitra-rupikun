import { SQL, sql } from "drizzle-orm";

export function sqlPagination(url: URL, defaultSort='id desc'): {
    page: number; limit: number;
    offset: number; search?: string | null
    ordering: SQL<any>;
} {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search')
    const offset = (page - 1) * limit;
    const ordering = url.searchParams.get('ordering') || ''

    let sort = sql`${defaultSort}`
    if (ordering && ordering !== "") {
        const desc = ordering.startsWith("-")
        const column = desc ? ordering.slice(1) : ordering

        if (column && desc) {
            sort = sql`${sql.identifier(column)} desc`
        }else{
            sort = sql`${sql.identifier(column)} asc`
        }
    }

    return {
        page,
        limit,
        offset,
        search,
        ordering: sort,
    }
}
