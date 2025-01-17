import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { ColumnDef } from "@tanstack/react-table";
import { and, eq, or, like, sql, desc, getTableColumns, asc } from "drizzle-orm";
import { Edit, Plus, Trash } from "lucide-react";
import { ActionDelete } from "~/components/ActionDelete";
import { DataTable } from "~/components/datatable";
import FormSearch from "~/components/FormSearch";
import InputCurrency, { convertCurrencyToDecimal, formatCurrency } from "~/components/InputCurrency";
import { PaginationPage } from "~/components/pagination-page";
import SheetAction from "~/components/SheetAction";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { db } from "~/drizzle/client.server";
import { product2Table } from "~/drizzle/schema";
import { onlyStaff } from "~/lib/auth.server";
import { sqlPagination } from "~/lib/query.server";
import { dateFormat } from "~/lib/time";
import { getPricelist } from "./panel.pulsa";
import { DigiCategory } from "~/lib/digiflazz";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { OPTION_SERVICES } from "./panel._index";

export async function loader(req: LoaderFunctionArgs) {
    const user = await onlyStaff(req)
    const url = new URL(req.request.url)
    const mydb = db(req.context.cloudflare.env.DB)
    const filter = sqlPagination(url, 'created_at desc')
    const search = url.searchParams
    const mytable = product2Table
    const allColumns = getTableColumns(mytable)
    const searchableFields = [mytable.name]

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

export async function action(req: ActionFunctionArgs) {
    const user = await onlyStaff(req)
    const formData = await req.request.formData()

    const mydb = db(req.context.cloudflare.env.DB)
    const intent = formData.get("intent")

    try {
        if (intent === "ADD_DATA") {
            const data = Object.fromEntries(formData)
            const d = await mydb.insert(product2Table).values({
                ...data,
                code: crypto.randomUUID(),
                price: convertCurrencyToDecimal(formData.get("price")?.toString() || "0"),
                created_by: user.id,
                updated_by: user.id,
            }).returning({ id: product2Table.id })

            return {
                success: true
            }
        }

        if (intent === "EDIT_DATA") {
            const data = Object.fromEntries(formData)
            const id = Number(data.id)
            await mydb.update(product2Table).set({
                ...data,
                price: convertCurrencyToDecimal(formData.get("price")?.toString() || "0"),
                updated_by: user.id,
                updated_at: new Date().getTime(),
            }).where(eq(product2Table.id, id))

            return {
                success: true
            }
        }

        if (intent === "DELETE") {
            const id = Number(formData.get("id"))
            await mydb.delete(product2Table).where(eq(product2Table.id, id))
            return {
                success: true
            }
        }

        if (intent === "UPDATE_DATA") {
            const id = Number(formData.get("id"))
            await mydb.update(product2Table).set({
                data: JSON.stringify(JSON.parse(formData.get("data") as string)),
                updated_at: new Date().getTime(),
                updated_by: user.id,
            }).where(eq(product2Table.id, id))

            return {
                success: true
            }
        }

        if (intent === "SYNC_PRODUCT") {
            const category = formData.get("category")?.toString() as DigiCategory
            const product = await getPricelist(req.context.cloudflare.env, category, category)

            const list_product = product.map(e => ({
                code: e.buyer_sku_code,
                name: e.product_name,
                price: category === "Pulsa" ? generatePrice(e.product_name, 3000) : e.price,
                data: JSON.stringify(e),
                created_by: user.id,
                updated_by: user.id,
            }))

            list_product.forEach(async (e, i) => {
                await mydb
                    .insert(product2Table)
                    .values(e)
                    .onConflictDoUpdate({
                        target: product2Table.code,
                        set: { name: e.name, price: e.price, data: JSON.stringify(e), updated_at: new Date().getTime() },
                    })
            })

            return {
                success: true
            }
        }
    } catch (error) {
    }
    return { error: "Failed" }
}

function generatePrice(input: string, additionalAmount: number): number {
    const split_price = input.split(" ")
    const basePrice = Number(split_price.at(-1)?.replaceAll(".", '')) || 0
    const finalPrice = basePrice + additionalAmount;
    return finalPrice;
}


type TData = typeof product2Table.$inferSelect
const collums: ColumnDef<TData>[] = [
    {
        cell: (d) => <div className="flex gap-2">
            <ButtonEdit data={d.row.original} />
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
        id: "code",
        accessorKey: 'code',
        header: "Code"
    },
    {
        id: "name",
        accessorKey: 'name',
        header: "Name"
    },
    {
        id: "price",
        accessorFn: (d) => formatCurrency(d?.price?.toString() || "0"),
        header: "Price Sell"
    },
    // {
    //     id: "created_at",
    //     accessorFn: (d) => dateFormat(new Date(d.created_at || 0)),
    //     header: "CreatedAt"
    // },
    {
        id: "updated_at",
        accessorFn: (d) => dateFormat(new Date(d.updated_at || 0)),
        header: "UpdatedAt"
    },
]


export default function DashboardProduct() {
    const loadData = useLoaderData<typeof loader>()
    const [params, setParams] = useSearchParams()


    return (
        <div className="space-y-4 px-4 md:px-0">
            <div className="text-2xl font-bold">Product</div>
            <FormSearch action={<div className="flex items-center gap-2">
                {/* <FilterData /> */}
                <AddData />
                <SyncData />
            </div>} />
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


function ButtonEdit({ data }: { data: TData }) {
    return <SheetAction keyReq={`EDIT_${data.id}`} title="Edit Data" triger={<Button size="sm"><Edit size={20} /> <span className="block md:hidden">Edit</span></Button>}>
        <input name="intent" value="EDIT_DATA" hidden readOnly />
        <input name="id" value={data.id} hidden readOnly />
        <RenderForm data={data} />
    </SheetAction>
}

function RenderForm({ data }: { data?: TData }) {
    return <>
        <div>
            <Label htmlFor="code">Code</Label>
            <Input name="code" placeholder="Code" defaultValue={data?.code || ''} />
        </div>
        <div>
            <Label htmlFor="name">Name</Label>
            <Input name="name" placeholder="Name" defaultValue={data?.name || ''} />
        </div>
        <div>
            <Label htmlFor="price">Price Sell</Label>
            <InputCurrency name="price" id="price" defaultValue={data?.price?.toString() || '0'} />
        </div>
    </>
}

function AddData() {
    return <SheetAction title="Add Data" triger={<Button><Plus /> Add Data</Button>}>
        <input name="intent" value="ADD_DATA" hidden readOnly />
        <RenderForm />
    </SheetAction>
}

function SyncData() {
    return <SheetAction keyReq={`SYNC_PRODUCT`} title="Edit Data" triger={<Button><Plus /> Sync</Button>}>
        <input name="intent" value="SYNC_PRODUCT" hidden readOnly />
        <Label htmlFor="category">Jenis Game : </Label>
        <Select name="category">
            <SelectTrigger>
                <SelectValue placeholder="Pilih Category" />
            </SelectTrigger>
            <SelectContent>
                {OPTION_SERVICES.map(e => {
                    return <SelectItem value={e.label} key={e.label}>{e.label}</SelectItem>
                })}
            </SelectContent>
        </Select>
    </SheetAction>

}

function FilterData() {

}