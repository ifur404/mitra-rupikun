import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { and, desc, eq, or } from "drizzle-orm";
import { db } from "~/drizzle/client.server";
import { ledgerTable } from "~/drizzle/schema";
import { onlyStaff } from "~/lib/auth.server";
import { sqlPagination } from "~/lib/query.server";

export async function loader(req: LoaderFunctionArgs) {
    const user = await onlyStaff(req)
    const mydb = db(req.context.cloudflare.env.DB)
    const url = new URL(req.request.url)
    const filter = sqlPagination(url)
    
    const {key, type} = Object.fromEntries(url.searchParams)
    const where = and(
        eq(ledgerTable.key, Number(key)).if(key),
        eq(ledgerTable.type, String(type)).if(type),
    )
        
    const data = await mydb.query.ledgerTable.findMany({
        where: where,
        limit: filter.limit,
        orderBy: desc(ledgerTable.created_at)
    })
    return Response.json(data)
}