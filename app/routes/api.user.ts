import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { SQL, and, desc, getTableColumns, like, or, sql } from "drizzle-orm";
import { db } from "~/drizzle/client.server";
import { ledgerTable, userTable } from "~/drizzle/schema";
import { onlyStaff } from "~/lib/auth.server";
import { sqlFilterBackend } from "~/lib/query.server";
import { hasKeysInJson } from "./dashboard.ledger";


export async function loader(req: LoaderFunctionArgs) {
    const user = await onlyStaff(req);
    const url = new URL(req.request.url);
    const mydb = db(req.context.cloudflare.env.DB);
    const filter = sqlFilterBackend(url, 'created_at desc');
    const search = url.searchParams;
    const searchableFields = [userTable.name, userTable.email, userTable.phone_number];

    const where = and(
        or(...searchableFields.map((c) => like(c, `%${filter.search}%`)))?.if(filter.search)
    );

    const total = await mydb.select({
        totalCount: sql<number>`COUNT(*)`.as("totalCount"),
    }).from(userTable).where(where)


    const data = await mydb
        .select({
            id: userTable.id,
            name: userTable.name,
            email: userTable.email,
            phone_number: userTable.phone_number,
            picture: userTable.picture,
        }).from(userTable)
        .where(where)
        .limit(filter.limit)
        .offset(filter.offset)
        .orderBy(filter.ordering);

    return {
        data: data,
        page: {
            limit: filter.limit,
            offset: filter.offset,
            page: filter.page,
            total: total[0].totalCount,
            pages: Math.ceil(total[0].totalCount / filter.limit),
        },
    }
}