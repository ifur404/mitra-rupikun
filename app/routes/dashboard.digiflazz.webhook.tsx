import { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData, useSearchParams } from "@remix-run/react"
import { ColumnDef } from "@tanstack/react-table"
import { and, desc, getTableColumns, like, or, sql } from "drizzle-orm"
import { DataTable } from "~/components/datatable"
import FormSearch from "~/components/FormSearch"
import OpenDetail from "~/components/OpenDetail"
import { PaginationPage } from "~/components/pagination-page"
import { db } from "~/drizzle/client.server"
import { webhookTable } from "~/drizzle/schema"
import { onlyStaff } from "~/lib/auth.server"
import { sqlPagination } from "~/lib/query.server"
import { dateFormat } from "~/lib/time"

export async function loader(req: LoaderFunctionArgs) {
    const user = await onlyStaff(req)
    const url = new URL(req.request.url)
    const mydb = db(req.context.cloudflare.env.DB)
    const filter = sqlPagination(url)
    const search = url.searchParams
    const mytable = webhookTable
    const searchableFields = [mytable.id]

    const where = and(
        and(
            or(...searchableFields.map((c) => like(c, `%${filter.search}%`)))?.if(filter.search)
        )
    )
    const total = await mydb.select({
        totalCount: sql<number>`COUNT(*)`.as("totalCount"),
    }).from(mytable).where(where)

    const data = await mydb
        .select({ ...getTableColumns(mytable) }).from(mytable)
        .where(where)
        .limit(filter.limit)
        .offset(filter.offset)
        .orderBy(desc(mytable.created_at))

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

type TData = typeof webhookTable.$inferSelect
const collums: ColumnDef<TData>[] = [
  {
    id: "id",
    accessorKey: 'id',
    header: "ID"
  },
  {
    cell: (d) => <OpenDetail str={d.row.original.data || ''} />,
    header: "Data"
  },
  {
    id: "created_at",
    accessorFn: (d) => dateFormat(new Date(d.created_at || 0)),
    header: "CreatedAt"
  },
]



export default function dashboarddigiflazzwebhook() {
    const loadData = useLoaderData<typeof loader>()
    const [params, setParams] = useSearchParams()

    return (
        <div className="space-y-4">
            <div className="text-2xl font-bold">Webhook</div>
            <FormSearch action={<>
            </>} />
            <DataTable data={loadData.data} columns={collums} />

            <PaginationPage page={loadData.page} onChangePage={(e) => {
                const params = new URLSearchParams();
                params.set("page", e.toString());
                setParams(params, {
                    preventScrollReset: true,
                });
            }} />
        </div>
    )
}
