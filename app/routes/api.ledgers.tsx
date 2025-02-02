import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { and, getTableColumns, like, or } from "drizzle-orm";
import { db } from "~/drizzle/client.server";
import { ledgerTable } from "~/drizzle/schema";
import { onlyStaff } from "~/lib/auth.server";
import { sqlFilterBackend } from "~/lib/query.server";
import { hasKeysInJson } from "./dashboard.ledger";

export async function loader(req: LoaderFunctionArgs) {
    const user = await onlyStaff(req);
    const url = new URL(req.request.url);
    const mydb = db(req.context.cloudflare.env.DB);
    const filter = sqlFilterBackend(url, 'created_at desc');
    const search = url.searchParams;
    const mytable = ledgerTable;
    const allColumns = getTableColumns(mytable);
    const searchableFields = [mytable.data];

    const datakey = search.get("datakey")?.split(',').map(k => k.trim()) || [];

    const where = and(
        hasKeysInJson(mytable.data, datakey),
        or(...searchableFields.map((c) => like(c, `%${filter.search}%`)))?.if(filter.search)
    );

    const data = await mydb
        .select({ ...allColumns }).from(mytable)
        .where(where)
        .limit(filter.limit)
        .offset(filter.offset)
        .orderBy(filter.ordering);

    return {
        data
    };
}