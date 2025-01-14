import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { and, desc, eq } from "drizzle-orm";
import { db } from "~/drizzle/client.server";
import { ledgerTable } from "~/drizzle/schema";
import { allowAny } from "~/lib/auth.server";
import { sqlPagination } from "~/lib/query.server";
import { BottonNav, HeaderBack } from "./panel._index";
import { Link, useLoaderData } from "@remix-run/react";
import { TFormPulsa } from "./panel.pulsa";
import { TResponseTransaction } from "~/lib/digiflazz";
import { TFormTopUp } from "./dashboard.user";
import { LedgerTypeEnum } from "~/data/enum";
import { formatCurrency } from "~/components/InputCurrency";

export type TDataLedger = {
  form?: TFormPulsa,
  response?: TResponseTransaction
} & TFormTopUp

export async function loader(req: LoaderFunctionArgs) {
  const user = await allowAny(req)
  const mydb = db(req.context.cloudflare.env.DB)
  const url = new URL(req.request.url)
  const filter = sqlPagination(url)

  const { key, type } = Object.fromEntries(url.searchParams)
  const where = and(
    eq(ledgerTable.key, user.id),
  )

  const data = await mydb.query.ledgerTable.findMany({
    where: where,
    limit: filter.limit,
    orderBy: desc(ledgerTable.created_at)
  })
  return data.map(e => {
    const d = JSON.parse(e.data || '') as TDataLedger
    return { ...e, data: d }
  })
}

export default function paneltransaksi() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <div className="space-y-4">
      <HeaderBack title="Transaksi" />
      <div className="flex flex-col gap-4">
        {loaderData.map((e, i) => {
          if (e.type === LedgerTypeEnum.BALANCE_USER) {
            return <Link to={`/panel/transaksi/${e.uuid}`} key={e.uuid} className="p-4 rounded-lg border">
              <div>Top Up </div>
              <b>{formatCurrency(e.mutation?.toString() || '')}</b>
              <div className="text-xs">{e.data?.note}</div>
            </Link>
          }
          return <Link to={`/panel/transaksi/${e.uuid}`} key={e.uuid} className="p-4 rounded-lg border">
            <div>Pembelian Pulsa - {e.data.form?.paket?.product_name}</div>
            <b>{formatCurrency(e.mutation?.toString() || '')}</b>
            <div className="text-xs">{e.data?.response?.status}</div>
          </Link>
        })}
      </div>
      <BottonNav />
    </div>
  )
}
