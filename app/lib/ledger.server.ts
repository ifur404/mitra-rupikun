import { and, asc, between, desc, eq, sql } from "drizzle-orm"
import { db } from "~/drizzle/client.server"
import { ledgerTable, productTable } from "~/drizzle/schema"

export async function getListDB(env: Env, category?: string) {
    const mydb = db(env.DB)
    const result = await mydb.query.productTable.findMany({
        where: eq(productTable.category, category || '').if(category),
        orderBy: asc(productTable.price),
    })
    return result
}

export async function refundTransaction(env: Env, data: typeof ledgerTable.$inferSelect | undefined) {
    const mydb = db(env.DB)
    const last = await mydb.query.ledgerTable.findFirst({
        where: eq(ledgerTable.key, data?.created_by?.toString() || ''),
        orderBy: desc(ledgerTable.created_at),
    })
    const after = ((last?.after || 0) + (data?.mutation || 0))
    await mydb.insert(ledgerTable).values({
        before: last?.after,
        mutation: data?.mutation,
        after: after,
        key: data?.created_by?.toString() || '',
        uuid: crypto.randomUUID(),
        data: {
            refund_id: data?.id.toString(),
        }
    })
}


export async function sumProfitUser(env: Env, id?: string, date_range: number[]=[]) {
    const mydb = db(env.DB)
    const [date_start, date_end] = date_range
    const q_profit = await mydb
        .select({
            totalProfit: sql<number>`SUM(json_extract(${ledgerTable.data}, '$.calculate.profit'))`
        })
        .from(ledgerTable).where(and(
            id ? eq(ledgerTable.key, id) : undefined,
            date_range?.length > 0 ? between(ledgerTable.created_at, date_range[0], date_range[1]) : undefined
        ));
        
    return q_profit[0].totalProfit || 0
}

export async function sumTotalMutation(env: Env) {
    const mydb = db(env.DB)

    const q_mutation = await mydb
        .select({
            total: sql<number>`SUM(json_extract(${ledgerTable.data}, '$.calculate.price_sell'))`
        })
        .from(ledgerTable)
        
    return q_mutation[0].total || 0
}