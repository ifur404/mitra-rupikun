import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { ColumnDef } from "@tanstack/react-table";
import { and, eq, isNull, isNotNull, or, like, sql, desc, getTableColumns } from "drizzle-orm";
import { Edit, Loader, Plus, Search, Trash } from "lucide-react";
import { useEffect } from "react";
import { ActionDelete } from "~/components/ActionDelete";
import { DataTable } from "~/components/datatable";
import FormSearch from "~/components/FormSearch";
import InputCurrency, { convertCurrencyToDecimal, formatCurrency } from "~/components/InputCurrency";
import { MultiComboBox } from "~/components/multi-combobox";
import { PaginationPage } from "~/components/pagination-page";
import SheetAction from "~/components/SheetAction";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { db } from "~/drizzle/client.server";
import { productTable, productTagTable, tagTable, userTable } from "~/drizzle/schema";
import useTags from "~/hooks/use-tag";
import { onlyStaff } from "~/lib/auth.server";
import { sqlPagination } from "~/lib/query.server";
import { dateFormat } from "~/lib/time";

export async function loader(req: LoaderFunctionArgs) {
  const user = await onlyStaff(req)
  const url = new URL(req.request.url)
  const mydb = db(req.context.cloudflare.env.DB)
  const filter = sqlPagination(url)
  const search = url.searchParams
  const mytable = productTable
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
    .select({ ...getTableColumns(mytable) }).from(mytable)
    .where(where)
    .limit(filter.limit)
    .offset(filter.offset)
    .orderBy(desc(mytable.updated_at))

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
      const d = await mydb.insert(productTable).values({
        ...data,
        price: convertCurrencyToDecimal(formData.get("price")?.toString() || "0"),
        price_sell: convertCurrencyToDecimal(formData.get("price_sell")?.toString() || "0"),
        created_by: user.id,
        updated_by: user.id,
      }).returning({ id: productTable.id })

      const tags = (data?.tags as string).split(",")
      if (tags.length > 0) {
        const values = tags.map(e => ({ product_id: d[0].id, tag_id: Number(e) }))
        await mydb.insert(productTagTable).values(values)
      }
      return {
        success: true
      }
    }

    if (intent === "EDIT_DATA") {
      const data = Object.fromEntries(formData)
      const id = Number(data.id)
      await mydb.update(productTable).set({
        ...data,
        price: convertCurrencyToDecimal(formData.get("price")?.toString() || "0"),
        price_sell: convertCurrencyToDecimal(formData.get("price_sell")?.toString() || "0"),
        updated_by: user.id,
        updated_at: new Date().getTime(),
      }).where(eq(productTable.id, id))
      await mydb.delete(productTagTable).where(eq(productTagTable.product_id, id))
      const tags = (data?.tags as string).split(",")
      if (tags.length > 0) {
        const values = tags.map(e => ({ product_id: id, tag_id: Number(e) }))
        await mydb.insert(productTagTable).values(values)
      }
      return {
        success: true
      }
    }

    if (intent === "DELETE") {
      const id = Number(formData.get("id"))
      await mydb.delete(productTable).where(eq(productTable.id, id))
      return {
        success: true
      }
    }
  } catch (error) {
  }
  return { error: "Failed" }
}

type TData = typeof productTable.$inferSelect
const collums: ColumnDef<TData>[] = [
  {
    cell: (d) => <div className="flex gap-2">
      <ButtonEdit data={d.row.original} />
      <ActionDelete id={d.row.original.id}>
        <Button size="sm"><Trash size={20} /></Button>
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
    id: "name",
    accessorKey: 'name',
    header: "Name"
  },
  {
    id: "price",
    accessorFn: (d) => formatCurrency(d?.price?.toString() || "0"),
    header: "Price"
  },
  {
    id: "price_sell",
    accessorFn: (d) => formatCurrency(d?.price_sell?.toString() || "0"),
    header: "Price Sell"
  },
  {
    cell: (d) => <ShowTags data={d.row.original} />,
    header: "Tags"
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


export default function DashboardProduct() {
  const loadData = useLoaderData<typeof loader>()
  const [params, setParams] = useSearchParams()

  return (
    <div className="space-y-4">
      <div className="text-2xl font-bold">Product</div>
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

function ButtonEdit({ data }: { data: TData }) {
  const { fetcher } = useTags(data.id)

  return <SheetAction keyReq={`EDIT_${data.id}`} title="Edit Data" triger={<Button size="sm"><Edit size={20} /></Button>}>
    <input name="intent" value="EDIT_DATA" hidden readOnly />
    <input name="id" value={data.id} hidden readOnly />
    <RenderForm data={data}/>
    <div>
      <Label htmlFor="tags">Tags</Label>
      <div>
        <MultiComboBox name="tags" pathApi={"/api/master/tags?type=pulsa"} defaultValue={fetcher.data?.map(e=> ({value:e.tag.toString(), label:e.tag_name}))} />
      </div>
    </div>
  </SheetAction>
}

function RenderForm({ data }: { data?: TData }) {
  return <>
    <div>
      <Label htmlFor="name">Name</Label>
      <Input name="name" placeholder="Name" defaultValue={data?.name || ''} />
    </div>
    <div>
      <Label htmlFor="price">Price</Label>
      <InputCurrency name="price" id="price" defaultValue={data?.price?.toString() || '0'} />
    </div>
    <div>
      <Label htmlFor="price_sell">Price Sell</Label>
      <InputCurrency name="price_sell" id="price_sell" defaultValue={data?.price_sell?.toString() || '0'} />
    </div>
  </>
}

function AddData() {
  return <SheetAction title="Add Data" triger={<Button><Plus className="mr-2" /> Add Data</Button>}>
    <input name="intent" value="ADD_DATA" hidden readOnly />
    <RenderForm />
    <div>
      <Label htmlFor="tags">Tags</Label>
      <div>
        <MultiComboBox name="tags" pathApi={"/api/master/tags?type=pulsa"} />
      </div>
    </div>

  </SheetAction>
}

function ShowTags({ data }: { data: TData }) {
  const { fetcher } = useTags(data.id)
  if(fetcher.state!=="idle") return <span><Loader className="animate-spin" size={20}/></span>
  return <span>{fetcher.data?.map(e => e.tag_name).join(", ")}</span>
}