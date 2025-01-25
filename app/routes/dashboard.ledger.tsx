import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { ColumnDef } from "@tanstack/react-table";
import { and, or, like, sql, getTableColumns, eq, desc } from "drizzle-orm";
import { DataTable } from "~/components/datatable";
import FormSearch from "~/components/FormSearch";
import { formatCurrency } from "~/components/InputCurrency";
import { PaginationPage } from "~/components/pagination-page";
import { db } from "~/drizzle/client.server";
import { ledgerTable, productTable } from "~/drizzle/schema";
import { onlyStaff } from "~/lib/auth.server";
import { sqlFilterBackend } from "~/lib/query.server";
import { dateFormat } from "~/lib/time";
import OpenDetail from "~/components/OpenDetail";
import { ActionDelete } from "~/components/ActionDelete";
import { Button } from "~/components/ui/button";
import { Loader2, Sheet, Trash } from "lucide-react";
import { useEffect } from "react";
import * as XLSX from 'xlsx'
import { pickKeys } from "./panel.pulsa";

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
    const data = await mydb
        .select({ ...allColumns }).from(mytable)
        .where(where)
        .limit(filter.limit)
        .offset(filter.offset)
        .orderBy(filter.ordering)
    
    const total = await mydb.select({
        totalCount: sql<number>`COUNT(*)`.as("totalCount"),
    }).from(mytable).where(where)

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

export async function action(req: ActionFunctionArgs) {
    const user = await onlyStaff(req)
    const formData = await req.request.formData()

    const mydb = db(req.context.cloudflare.env.DB)
    const intent = formData.get("intent")
    if (intent === "DELETE") {
        const id = Number(formData.get("id"))
        // const last = await mydb.query.ledgerTable.findFirst({
        //     where: eq(ledgerTable.id, id),
        //     orderBy: desc(ledgerTable.created_at)
        // })
        await mydb.delete(ledgerTable).where(eq(ledgerTable.id, id))
        return {
            success: true
        }
    }
   
    throw new Error("Not Valid")
}


type TData = typeof ledgerTable.$inferSelect
const collums: ColumnDef<TData>[] = [
    {
        cell: (d) => <div className="flex gap-2">
            {/* <ButtonEdit data={d.row.original} /> */}
            <ActionDelete id={d.row.original.id}>
                <Button size="sm" variant="destructive"><Trash size={20} /> <span className="block md:hidden">Delete</span></Button>
            </ActionDelete>
        </div>,
        header: "Action"
    },
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
            <FormSearch action={<>
                <ButtonExport />
            </>} />
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

function ButtonExport(){
    const fetcher = useFetcher<typeof loader>()
    const [params, setParams] = useSearchParams()

    const loading = fetcher.state !== "idle"

    useEffect(()=> {
        if(fetcher.state && fetcher.data){
            const data = fetcher.data.data.map(e=> ({
                id: e.id,
                uuid: e.uuid,
                key: e.key,
                before: e.before,
                mutation: e.mutation,
                after: e.after,
                profit: e.data?.calculate?.app || 0,
                data: Object.keys(pickKeys(e.data || {}, ['pulsa','games', 'emoney', 'refund_id', 'topup']))[0] || '',
                created_at: new Date(e.created_at || ''),
            }))
            const wb = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(data)
            XLSX.utils.book_append_sheet(wb, worksheet, "Report");
            XLSX.writeFile(wb, "Report.xlsb");
        }
    },[fetcher.state])
    return <Button disabled={loading} onClick={()=> {
        const p = params
        p.append("limit","10000")
        fetcher.load(`?${p.toString()}`)
    }}>
        {loading ? <Loader2 className="animate-spin"/> : <Sheet />} Export 
    </Button>
}