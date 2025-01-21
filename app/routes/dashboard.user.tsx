import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useFetcher, useLoaderData, useRevalidator, useSearchParams } from "@remix-run/react"
import { ColumnDef } from "@tanstack/react-table"
import { and, desc, eq, getTableColumns, like, or, sql } from "drizzle-orm"
import { ChevronDown, Edit } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { DataTable } from "~/components/datatable"
import FormSearch from "~/components/FormSearch"
import InputCurrency, { convertCurrencyToDecimal, formatCurrency } from "~/components/InputCurrency"
import { PaginationPage } from "~/components/pagination-page"
import SheetAction from "~/components/SheetAction"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { LedgerTypeEnum } from "~/data/enum"
import { db } from "~/drizzle/client.server"
import { ledgerTable, userTable } from "~/drizzle/schema"
import useUserBalance from "~/hooks/use-user-balance"
import { onlyStaff } from "~/lib/auth.server"
import { sqlFilterBackend } from "~/lib/query.server"
import { dateFormat } from "~/lib/time"

export async function loader(req: LoaderFunctionArgs) {
  const user = await onlyStaff(req)
  const url = new URL(req.request.url)
  const mydb = db(req.context.cloudflare.env.DB)
  const filter = sqlFilterBackend(url, 'name')
  const search = url.searchParams
  const mytable = userTable
  const searchableFields = [mytable.name, mytable.phone_number, mytable.email, mytable.groups]

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

export type TFormTopUp = {
  note: string;
}

export async function action(req: ActionFunctionArgs) {
  const user = await onlyStaff(req)
  const formData = await req.request.formData()

  const mydb = db(req.context.cloudflare.env.DB)
  const intent = formData.get("intent")
  if (intent === "ADD_BALANCE") {
    const user_id = Number(formData.get("user_id"))
    const append_balance = convertCurrencyToDecimal(formData.get("amount")?.toString() || '0')
    const before = await mydb.query.ledgerTable.findFirst({
      where: and(eq(ledgerTable.key, user_id.toString())),
      orderBy: desc(ledgerTable.created_at)
    })
    const before_balance = before?.id ? Number(before.after) : 0

    const topup: TFormTopUp = {
      note: formData.get("note")?.toString() || ""
    }

    await mydb.insert(ledgerTable).values({
      key: user_id.toString(),
      before: before_balance,
      mutation: append_balance,
      after: before_balance + append_balance,
      data: {
        topup: topup,
      },
      created_at: new Date().getTime(),
      created_by: user.id
    })
    return { success: true }
  }
  return { error: "gagal" }
}

type TData = typeof userTable.$inferSelect
const collums: ColumnDef<TData>[] = [
  // {
  //   cell: (d) => <div className="flex gap-2">
  //     <ButtonEdit data={d.row.original} />
  //   </div>,
  //   header: "Action"
  // },
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
    id: "email",
    accessorKey: 'email',
    header: "Email"
  },
  {
    id: "phone_number",
    accessorKey: 'phone_number',
    header: "Phone Number"
  },
  {
    id: "is_staff",
    cell: ({ row: { original } }) => <ShowIsBoolean num={original.is_staff || 0} />,
    header: "Is Staff"
  },
  {
    id: "saldo",
    cell: ({ row: { original } }) => <ShowSaldo data={original} />,
    header: "Saldo"
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

export default function DashboardUser() {
  const loadData = useLoaderData<typeof loader>()
  const [params, setParams] = useSearchParams()

  return (
    <div className="space-y-4">
      <div className="text-2xl font-bold">Transaction</div>
      <FormSearch action={<>
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

export function ShowIsBoolean({ num }: { num: number }) {
  return <span>{num === 0 && "Tidak"} {num === 1 && "Ya"}</span>
}

function ShowSaldo({ data }: { data: TData }) {

  const b = useUserBalance(data.id)
  const [show, setShow] = useState(false)
  const fetcher = useFetcher<typeof action>({ key: `topup_${data.id}` })
  const balance = b.saldo
  const balance_idr = formatCurrency(balance.toString())

  function toggleShow() {
    setShow(cur => !cur)
  }
  useEffect(() => {
    if (fetcher.state === "idle") {
      if (fetcher.data?.success) {
        b.getSaldo()
        toast.error("Berhasil top up ")
        toggleShow()
      }
      if (fetcher.data?.error) {
        toast.error("Failed")
      }
    }
  }, [fetcher.state]);

  return <Dialog open={show} onOpenChange={toggleShow}>
    <DialogTrigger asChild>
      <button className="w-full flex">{balance_idr} <ChevronDown /></button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Saldo</DialogTitle>
        <DialogDescription>Total saldo tersedia <b>{data.name}</b> {balance_idr}</DialogDescription>
      </DialogHeader>
      <form className="space-y-4" onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        formData.append("intent", "ADD_BALANCE")
        formData.append("user_id", data.id.toString())
        fetcher.submit(formData, {
          method: "POST"
        })
      }}>
        <div>
          <Label htmlFor="amount">Jumlah </Label>
          <InputCurrency name="amount" id="amount" defaultValue={"0"} />
        </div>
        <div>
          <Label htmlFor="note">Note </Label>
          <Textarea name="note" id="note" rows={4} defaultValue={`Top up user ${data.name}`} />
        </div>
        <p className="text-xs text-gray-500">Enter the amount you want to add to your balance.</p>
        <Button type="submit" disabled={fetcher.state !== "idle"}>Top Up</Button>
      </form>
    </DialogContent>
  </Dialog>
}

function ButtonEdit({ data }: { data: TData }) {
  return <SheetAction keyReq={`EDIT_${data.id}`} title="Edit Data" triger={<Button size="sm"><Edit size={20} /></Button>}>
    <input name="intent" value="EDIT_DATA" hidden readOnly />
    <input name="id" value={data.id} hidden readOnly />
    {/* <RenderForm data={data}/> */}
  </SheetAction>
}
