import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { ColumnDef } from "@tanstack/react-table";
import { and, eq, isNull, isNotNull, or, like, sql, desc, getTableColumns } from "drizzle-orm";
import { Edit, Plus, Search, Trash } from "lucide-react";
import { ActionDelete } from "~/components/ActionDelete";
import { DataTable } from "~/components/datatable";
import FormSearch from "~/components/FormSearch";
import OpenDetail from "~/components/OpenDetail";
import { PaginationPage } from "~/components/pagination-page";
import SheetAction from "~/components/SheetAction";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { db } from "~/drizzle/client.server";
import { tagTable, userTable } from "~/drizzle/schema";
import { onlyStaff } from "~/lib/auth.server";
import { sqlPagination } from "~/lib/query.server";
import { dateFormat } from "~/lib/time";

export async function loader(req: LoaderFunctionArgs) {
  const user = await onlyStaff(req)
  const url = new URL(req.request.url)
  const mydb = db(req.context.cloudflare.env.DB)
  const filter = sqlPagination(url)
  const search = url.searchParams
  const searchableFields = [tagTable.name, tagTable.description]

  const where = and(
    eq(tagTable.type, search.get("type")?.toString() || '').if(search.has("type")),
    and(
      or(...searchableFields.map((c) => like(c, `%${filter.search}%`)))?.if(filter.search)
    )
  )
  const total = await mydb.select({
    totalCount: sql<number>`COUNT(*)`.as("totalCount"),
  }).from(tagTable).where(where)

  const data = await mydb
    .select({ ...getTableColumns(tagTable) }).from(tagTable)
    .where(where)
    .limit(filter.limit)
    .offset(filter.offset)
    .orderBy(desc(tagTable.updated_at))

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
      await mydb.insert(tagTable).values({
        ...Object.fromEntries(formData),
        created_by: user.id,
        updated_by: user.id,
      })
    }
    if (intent === "EDIT_DATA") {
      const data = Object.fromEntries(formData)
      const id = Number(data.id)
      await mydb.update(tagTable).set({
        ...data,
        updated_by: user.id,
        updated_at: new Date().getTime(),
      }).where(eq(tagTable.id, id))
    }

    if (intent === "DELETE") {
      const id = Number(formData.get("id"))
      await mydb.delete(tagTable).where(eq(tagTable.id, id))
    }
    return {
      success: true
    }

  } catch (error) {
    return { error: "Failed" }
  }
}
type TData = typeof tagTable.$inferSelect
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
    id: "type",
    accessorKey: 'type',
    header: "Type"
  },
  {
    id: "description",
    cell: (d) => <OpenDetail str={d.row.original?.description || ''} />,
    header: "Description"
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


export default function dashboardmastertags() {
  const loadData = useLoaderData<typeof loader>()
  const [params, setParams] = useSearchParams()

  return (
    <div className="space-y-4">
      <div className="text-2xl font-bold">Tags</div>
      <FormSearch action={<>
        <AddData />
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

function ButtonEdit({ data }: { data: TData }) {

  return <SheetAction keyReq={`EDIT_${data.id}`} title="Edit Data" triger={<Button size="sm"><Edit size={20} /></Button>}>
    <input name="intent" value="EDIT_DATA" hidden readOnly />
    <input name="id" value={data.id} hidden readOnly />
    <RenderForm data={data} />
  </SheetAction>
}

function AddData() {
  return <SheetAction title="Add Data" triger={<Button><Plus className="mr-2" /> Add Data</Button>}>
    <input name="intent" value="ADD_DATA" hidden readOnly />
    <RenderForm />
  </SheetAction>
}

function RenderForm({ data }: { data?: TData }) {
  return <>
    <div>
      <Label htmlFor="name">Name</Label>
      <Input name="name" placeholder="Name" defaultValue={data?.name || ''} />
    </div>
    <div>
      <Label htmlFor="type">Type</Label>
      <Input name="type" placeholder="type" defaultValue={data?.type || ''} />
    </div>
    <div>
      <Label htmlFor="description">Description</Label>
      <Textarea name="description" placeholder="Description" defaultValue={data?.description || ''} />
    </div>
  </>
}