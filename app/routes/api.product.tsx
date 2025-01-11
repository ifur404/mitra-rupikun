import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { and, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { db } from "~/drizzle/client.server";
import { productTable } from "~/drizzle/schema";
import { allowAny, onlyStaff } from "~/lib/auth.server";
import { sqlPagination } from "~/lib/query.server";

export async function loader(req: LoaderFunctionArgs) {
    const user = await onlyStaff(req)
    const mydb = db(req.context.cloudflare.env.DB)
    const url = new URL(req.request.url)
    const searchParams = url.searchParams

    const filter = sqlPagination(url)
    const searchableFields = [productTable.name, ]

    const where = and(
        and(
            or(...searchableFields.map((c) => like(c, `%${filter.search}%`)))?.if(filter.search)
        )
    )

    const total = await mydb.select({
        totalCount: sql<number>`COUNT(*)`.as("totalCount"),
    }).from(productTable).where(where)

    const data = await mydb.select({
        value: productTable.id,
        label: productTable.name
    }).from(productTable).where(where)
        .limit(1000)
        .offset(filter.offset)
        .orderBy(desc(productTable.updated_at))

    return Response.json({
        data: data.map(e=>({...e, value: e.value.toString()})),
        page: {
            limit: filter.limit,
            offset: filter.offset,
            page: filter.page,
            total: total[0].totalCount,
            pages: Math.ceil(total[0].totalCount / filter.limit),
        },
    })
}