import { asc, eq } from "drizzle-orm"
import { db } from "~/drizzle/client.server"
import { productTable } from "~/drizzle/schema"

export async function getListDB(env: Env, category?:string){
    const mydb = db(env.DB)
    const result = await mydb.query.productTable.findMany({
        where: eq(productTable.category, category || '').if(category),
        orderBy: asc(productTable.name),
    })
    return result
}