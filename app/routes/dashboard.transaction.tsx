import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData, useSearchParams } from "@remix-run/react"
import { ColumnDef } from "@tanstack/react-table"
import { and, desc, eq, getTableColumns, like, or, sql } from "drizzle-orm"
import { Plus } from "lucide-react"
import { ComboBox } from "~/components/combo-box"
import { DataTable } from "~/components/datatable"
import FormSearch from "~/components/FormSearch"
import { formatCurrency } from "~/components/InputCurrency"
import OpenDetail from "~/components/OpenDetail"
import { PaginationPage } from "~/components/pagination-page"
import SheetAction from "~/components/SheetAction"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { db } from "~/drizzle/client.server"
import { productTable, transactionTable, webhookTable } from "~/drizzle/schema"
import { onlyStaff } from "~/lib/auth.server"
import { CHOICE_STATUS, Digiflazz, TDataProvider, TRequestTransaction } from "~/lib/digiflazz"
import { sqlPagination } from "~/lib/query.server"
import { dateFormat } from "~/lib/time"

export async function loader(req: LoaderFunctionArgs) {
    const user = await onlyStaff(req)
    const url = new URL(req.request.url)
    const mydb = db(req.context.cloudflare.env.DB)
    const filter = sqlPagination(url)
    const search = url.searchParams
    const mytable = transactionTable
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

export async function action(req: ActionFunctionArgs) {
    const user = await onlyStaff(req)
    const formData = await req.request.formData()
  
    const mydb = db(req.context.cloudflare.env.DB)
    const intent = formData.get("intent")
    if(intent==="ADD_DATA"){
        const product = await mydb.query.productTable.findFirst({where: eq(productTable.id, Number(formData.get("product_id")))})
        if(!product) return {error: "Product tidak ditemukan"}
        const ref_id = crypto.randomUUID()
        const provider = JSON.parse(product.data || "{}") as TDataProvider
      

        const d = new Digiflazz(req.context.cloudflare.env.DIGI_USERNAME, req.context.cloudflare.env.DIGI_APIKEY)
        let payload: TRequestTransaction = {
            username: d.username,
            buyer_sku_code: provider.digiflazz?.buyer_sku_code || '',
            customer_no: formData.get("customer_no") as string,
            ref_id,
            sign: d.getSign(ref_id),
            cb_url: req.context.cloudflare.env.WEBHOOK_URL
        }

        if(process.env.NODE_ENV === 'development'){
            payload = {...payload, testing:true, customer_no:"087800001230", buyer_sku_code: "xld10"}
        }
        const response = await d.postRequest(payload)
        const res = await mydb.insert(transactionTable).values({
            product_id: product.id,
            user_id: user.id,
            amount: product.price_sell,
            price: product.price_sell,
            data: JSON.stringify({
                provider,
                input: Object.fromEntries(formData),
                request: payload,
                response,
            }),
            status: CHOICE_STATUS.find(e=> e.label === response.status)?.value || 4,
            date: new Date().getTime(),
            created_by: user.id,
            updated_by: user.id,
        }).returning({id: transactionTable.id})
        return {success: true}

    }

    return {success: true}
}

type TData = typeof transactionTable.$inferSelect
const collums: ColumnDef<TData>[] = [
    {
        id: "id",
        accessorKey: 'id',
        header: "ID"
    },
    {
        id: "price",
        accessorFn: (d) => formatCurrency(d?.price?.toString() || "0"),
        header: "Price"
    },
    {
        id: "amount",
        accessorFn: (d) => formatCurrency(d?.amount?.toString() || "0"),
        header: "Amount"
    },
    {
        id: "status",
        accessorFn: (d)=> CHOICE_STATUS.find(e=>e.value===d.status)?.label || "-",
        header: "Status"
    },
    {
        cell: (d) => <OpenDetail str={d.row.original.data || ''} view="textarea" />,
        header: "Data"
    },
    {
        id: "date",
        accessorFn: (d) => new Date(d.date || 0).toLocaleDateString("id-ID"),
        header: "Date"
    },
    {
        id: "created_at",
        accessorFn: (d) => dateFormat(new Date(d.created_at || 0)),
        header: "CreatedAt"
    },
    {
        id: "updated_at",
        accessorFn: (d) => dateFormat(new Date(d.updated_at || 0)),
        header: "UpdatedAt"
    },
]



export default function Transaction() {
    const loadData = useLoaderData<typeof loader>()
    const [params, setParams] = useSearchParams()

    return (
        <div className="space-y-4">
            <div className="text-2xl font-bold">Transaction</div>
            <FormSearch action={<>
                <AddData />
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

function AddData() {
    const formatPhoneNumber = (value: string): string => {
        // Hapus semua karakter yang bukan angka
        const cleaned = value.replace(/\D/g, "");

        // Pastikan input dimulai dengan 0
        if (!cleaned.startsWith("0")) {
            return "0" + cleaned.slice(0, 12); // Tambahkan 0 jika tidak ada
        }

        // Batasi hingga 12 angka (nomor telepon lokal Indonesia)
        return cleaned.slice(0, 12);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatPhoneNumber(e.target.value);
        e.target.value = formattedValue; // Langsung set nilai input di DOM
    };

    return <SheetAction title="Add Data" triger={<Button><Plus className="mr-2" /> Add Data</Button>}>
        <input name="intent" value="ADD_DATA" hidden readOnly />

        <div>
            <Label htmlFor="product_id">Product</Label>
            <ComboBox name="product_id" pathApi="/api/product" />
        </div>
        <div>
            <Label htmlFor="customer_no">Nomor</Label>
            <Input name="customer_no"
                type="text"
                onChange={handleChange}
                maxLength={12} 
                placeholder="ex: 082122012959" 
            />
        </div>

       
    </SheetAction>
}
