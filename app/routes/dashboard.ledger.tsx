import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { ColumnDef } from "@tanstack/react-table";
import { and, or, like, sql, getTableColumns } from "drizzle-orm";
import { DataTable } from "~/components/datatable";
import FormSearch from "~/components/FormSearch";
import { formatCurrency } from "~/components/InputCurrency";
import { PaginationPage } from "~/components/pagination-page";
import { db } from "~/drizzle/client.server";
import { ledgerTable } from "~/drizzle/schema";
import { onlyStaff } from "~/lib/auth.server";
import { sqlFilterBackend } from "~/lib/query.server";
import { dateFormat } from "~/lib/time";
import OpenDetail from "~/components/OpenDetail";

export async function loader(req: LoaderFunctionArgs) {
    const user = await onlyStaff(req)
    const url = new URL(req.request.url)
    const mydb = db(req.context.cloudflare.env.DB)
    const filter = sqlFilterBackend(url, 'created_at desc')
    const search = url.searchParams
    const mytable = ledgerTable
    const allColumns = getTableColumns(mytable)
    const searchableFields = [mytable.data]

    const where = and(
        and(
            or(...searchableFields.map((c) => like(c, `%${filter.search}%`)))?.if(filter.search)
        )
    )

    const total = await mydb.select({
        totalCount: sql<number>`COUNT(*)`.as("totalCount"),
    }).from(mytable).where(where)


    const data = await mydb
        .select({ ...allColumns }).from(mytable)
        .where(where)
        .limit(filter.limit)
        .offset(filter.offset)
        .orderBy(filter.ordering)


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


type TData = typeof ledgerTable.$inferSelect
const collums: ColumnDef<TData>[] = [

    {
        id: "id",
        accessorKey: 'id',
        header: "ID"
    },
    {
        id: "uuid",
        accessorKey: 'uuid',
        header: "uuid"
    },
    {
        id: "key",
        accessorKey: 'key',
        header: "key"
    },
    {
        id: "before",
        accessorFn: (d) => formatCurrency(d?.before?.toString() || "0"),
        header: "before"
    },
    {
        id: "mutation",
        accessorFn: (d) => formatCurrency(d?.mutation?.toString() || "0"),
        header: "mutation"
    },
    {
        id: "after",
        accessorFn: (d) => formatCurrency(d?.after?.toString() || "0"),
        header: "after"
    },
    {
        cell: (d) => <OpenDetail str={JSON.stringify(d.row.original.data)} view="textarea" />,
        header: "Data"
    },
    {
        id: "created_at",
        accessorFn: (d) => dateFormat(new Date(d.created_at || 0)),
        header: "CreatedAt"
    },
]


export default function DashboardLedger() {
    const loadData = useLoaderData<typeof loader>()
    const [params, setParams] = useSearchParams()

    return (
        <div className="space-y-4 px-4 md:px-0">
            <div className="text-2xl font-bold">Ledger</div>
            <FormSearch action={<></>} />
            <DataTable data={loadData.data} columns={collums} />

            <PaginationPage page={loadData.page} onChangePage={(e) => {
                setParams((prev) => {
                    const p = new URLSearchParams(prev)
                    p.set("page", e.toString())
                    return p
                }, {
                    preventScrollReset: true,
                });
            }} />
        </div>
    )
}