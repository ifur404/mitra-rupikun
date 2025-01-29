import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { and, desc, eq } from "drizzle-orm";
import { db } from "~/drizzle/client.server";
import { ledgerTable } from "~/drizzle/schema";
import { onlyStaff } from "~/lib/auth.server";
import { sumProfitUser } from "~/lib/ledger.server";
import { sqlFilterBackend } from "~/lib/query.server";

export async function loader(req: LoaderFunctionArgs) {
    const user = await onlyStaff(req)
    const mydb = db(req.context.cloudflare.env.DB)
    const url = new URL(req.request.url)
    const filter = sqlFilterBackend(url)
    
    const {key, type} = Object.fromEntries(url.searchParams)
    
    //profit
    if(type==="profit"){
        const {start, end} = Object.fromEntries(url.searchParams)
        return Response.json({sum: await sumProfitUser(req.context.cloudflare.env, key, [start, end].map(Number))})
    }

    // saldo
    const where = and(
        eq(ledgerTable.key, key).if(key),
    )
    
    const data = await mydb.query.ledgerTable.findFirst({
        where: where,
        orderBy: desc(ledgerTable.created_at)
    })
    const saldo = data?.after || 0
    return Response.json({sum: saldo})
}