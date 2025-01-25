import { asc, eq } from "drizzle-orm"
import { db } from "~/drizzle/client.server"
import { ledgerTable, productTable } from "~/drizzle/schema"

export async function getListDB(env: Env, category?:string){
    const mydb = db(env.DB)
    const result = await mydb.query.productTable.findMany({
        where: eq(productTable.category, category || '').if(category),
        orderBy: asc(productTable.price),
    })
    return result
}

export async function refundTransaction(env:Env, data: typeof ledgerTable.$inferSelect | undefined) {
    const mydb = db(env.DB)
    const last = await mydb.query.ledgerTable.findFirst({
        where: eq(ledgerTable.key, data?.created_by?.toString() || '')
    })
    const after = ((last?.after||0) + (data?.mutation ||0))
    await mydb.insert(ledgerTable).values({
        before: last?.after,
        mutation: data?.mutation,
        after: after,
        key: data?.created_by?.toString() || '',
        uuid: crypto.randomUUID(),
        data: {
            ref_id: data?.id.toString(),
        }
    })
}