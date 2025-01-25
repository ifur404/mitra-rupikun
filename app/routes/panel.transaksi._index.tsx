import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { and, eq, getTableColumns, like, or, sql } from "drizzle-orm";
import { db } from "~/drizzle/client.server";
import { ledgerTable } from "~/drizzle/schema";
import { allowAny } from "~/lib/auth.server";
import { sqlFilterBackend } from "~/lib/query.server";
import { BottonNav, HeaderBack } from "./panel._index";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { formatCurrency } from "~/components/InputCurrency";
import { PaginationPage } from "~/components/pagination-page";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Search } from "lucide-react";
import { TFormGame } from "./panel.games";
import { TFormPulsa } from "./panel.pulsa";
import { TFormTopUp } from "./dashboard.user";
import { TResponseTransaction, TWebhookData } from "~/lib/digiflazz";
import { TFormEmoney } from "./panel.e-money";

export type TDataLedger = {
  emoney?: TFormEmoney;
  games?: TFormGame;
  pulsa?: TFormPulsa;
  topup?: TFormTopUp;
  response?: TResponseTransaction;
  webhook?: TWebhookData;
  webhook_detail?: any;
  complain?: string;
  calculate?: {
    price_sell: number;
    digi: number;
    profit: number;
    app: number;
    mitra_sell: number;
  },
  ref_id?: string;
}

export const LIST_KEYS: (keyof TDataLedger)[] = ['pulsa', 'games', 'emoney']

export async function loader(req: LoaderFunctionArgs) {
  const user = await allowAny(req)
  const mydb = db(req.context.cloudflare.env.DB)
  const url = new URL(req.request.url)
  const filter = sqlFilterBackend(url, 'created_at desc')
  const searchableFields = [ledgerTable.key, ledgerTable.id, ledgerTable.data]

  const { key, type } = Object.fromEntries(url.searchParams)
  const where = and(
    eq(ledgerTable.key, user.id.toString()),
    and(
      or(...searchableFields.map((c) => like(c, `%${filter.search}%`)))?.if(filter.search)
    )
  )

  const total = await mydb.select({
    totalCount: sql<number>`COUNT(*)`.as("totalCount"),
  }).from(ledgerTable).where(where)

  const data = await mydb
    .select({ ...getTableColumns(ledgerTable) }).from(ledgerTable)
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

export default function paneltransaksi() {
  const loaderData = useLoaderData<typeof loader>()
  const [params, setParams] = useSearchParams()

  return (
    <div className="space-y-4">
      <HeaderBack title="Transaksi" />
      <form className="flex space-x-2" onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        formData.append("page", "1")
        const searchParams = new URLSearchParams(
          formData as unknown as Record<string, string>,
        ).toString();
        setParams(new URLSearchParams(searchParams))
      }}>
        <Input name="search" placeholder="Cari..." defaultValue={params.get("search") || ''} />
        <Button><Search /></Button>
      </form>
      <div className="flex flex-col gap-4">
        {loaderData.data.map((e, i) => {
          if (e.data?.topup) {
            return <Link to={`/panel/transaksi/${e.uuid}`} key={e.uuid} className="p-4 rounded-lg border">
              <div>Top up </div>
              <b>{formatCurrency(e.mutation?.toString() || '')}</b>
              <div className="text-xs mt-2">{e.data.topup.note}</div>
            </Link>
          }

          const d = e.data || {}
          const match = LIST_KEYS.find((key) => key in d && d[key] !== undefined);
          if (!match) return null
          const matchedData = d[match];
          const status = e.data?.webhook?.status || e.data?.response?.status
          return <Link to={`/panel/transaksi/${e.uuid}`} key={e.uuid} className="p-4 rounded-lg border">
            <div>{matchedData.product.name || '-'}</div>
            <b>{formatCurrency(e.mutation?.toString() || '')}</b>
            <div className="text-xs mt-2">{status}</div>
          </Link>
        })}
      </div>
      <PaginationPage page={loaderData.page} onChangePage={(e) => {
        const params = new URLSearchParams();
        params.set("page", e.toString());
        setParams(params, {
          preventScrollReset: true,
        });
      }} />
      <BottonNav />
    </div>
  )
}
