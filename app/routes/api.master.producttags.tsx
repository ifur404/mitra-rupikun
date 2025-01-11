import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { and, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { db } from "~/drizzle/client.server";
import { productTagTable, tagTable } from "~/drizzle/schema";
import { allowAny, onlyStaff } from "~/lib/auth.server";
import { sqlPagination } from "~/lib/query.server";

export async function loader(req: LoaderFunctionArgs) {
    const user = await onlyStaff(req)
    const mydb = db(req.context.cloudflare.env.DB)
    const url = new URL(req.request.url)
    const searchParams = url.searchParams
    const product_id = Number(searchParams.get("product_id"))

    const filter = sqlPagination(url)

    const where = and(
        eq(productTagTable.product_id, product_id),
    )
    const data = await mydb.select({
        id: productTagTable.id,
        tag: productTagTable.tag_id,
        tag_name: tagTable.name,
    }).from(productTagTable)
    .leftJoin(tagTable, eq(tagTable.id, productTagTable.tag_id))
    .where(where)
        .limit(1000)
        .offset(filter.offset)
        .orderBy(desc(productTagTable.created_at))

    console.log(data)

    return Response.json(data)
}