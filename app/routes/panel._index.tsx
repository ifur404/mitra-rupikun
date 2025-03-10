import { Link, useLoaderData } from "@remix-run/react"
import { ChevronLeft, Gamepad, Plug, Smartphone, Wallet } from 'lucide-react'
import { Home, List, User } from "lucide-react";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { allowAny } from "~/lib/auth.server";
import { db } from "~/drizzle/client.server";
import { desc, eq, sql } from "drizzle-orm";
import { ledgerTable } from "~/drizzle/schema";
import { formatCurrency } from "~/components/InputCurrency";
import { Button } from "~/components/ui/button";
import { sumProfitUser } from "~/lib/ledger.server";

export const OPTION_SERVICES = [
  { icon: Smartphone, label: "Pulsa", badge: "" },
  { icon: Gamepad, label: "Games", badge: "" },
  { icon: Wallet, label: "E-Money", badge: "" },
  { icon: Plug, label: "PLN", badge: "" },
]
const BOTTONNAVIGATION = [
  { icon: Home, label: "Home", url: '/panel' },
  { icon: List, label: "Transaksi", url: '/panel/transaksi' },
  { icon: User, label: "Akun", url: '/panel/akun' },
]

export async function loader(req: LoaderFunctionArgs) {
  const user = await allowAny(req)
  const mydb = db(req.context.cloudflare.env.DB)
  const ledger = await mydb.query.ledgerTable.findFirst({
    where: eq(ledgerTable.key, user.id.toString()),
    orderBy: desc(ledgerTable.created_at)
  })
  return {
    user,
    saldo: ledger?.after || 0,
    profit: await sumProfitUser(req.context.cloudflare.env, user.id.toString()) || 0
  }
}

export default function PanelHome() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <>
      <div>
        Halo {loaderData.user.name}
      </div>
      <div className="grid grid-cols-2 mt-4 gap-2">
        <div className="border p-2 rounded-lg space-y-2">
          <p className="text-xs">Saldo</p>
          <div className="text-xl font-bold">{formatCurrency(loaderData.saldo.toString())}</div>
          <div className="mt-2 border-t pt-2">
            <Link to="https://wa.me/6282122012959?text=Saya Mau Top Up Saldo Mitra" target="_blank"><Button size="sm" variant="default" className="w-full">Top up</Button></Link>
          </div>
        </div>
        <div className="border p-2 rounded-lg space-y-2">
          <p className="text-xs">Perhitungan Profit</p>
          {/* <div className="text-2xl font-bold">{formatCurrency("0")}</div> */}
          <div className="text-xl font-bold">{formatCurrency(loaderData.profit.toString())}</div>
          {/* <p className="text-xs"></p> */}
        </div>
      </div>

      <div className="grid grid-cols-grid grid-cols-3 gap-4 w-full mt-4 border rounded-lg p-4">
        {OPTION_SERVICES.map((service, index) => {
          const Icon = service.icon
          const url = `${service.label.toLowerCase()}`
          return (
            <Link to={url} key={index} className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg">
                  <Icon className="w-6 h-6 text-gray-600" />
                </div>
                {service.badge && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs text-white bg-red-500 rounded-full">
                    {service.badge}
                  </span>
                )}
              </div>
              <span className="text-sm text-center">{service.label}</span>
            </Link>
          )
        })}
      </div>
      <BottonNav />
    </>
  )
}


export function HeaderBack({ title, back_to = "/panel" }: { title: string; back_to?: string }) {
  return <div className="flex items-center gap-4 px-4 py-2 rounded-lg border ">
    <Link to={back_to} ><ChevronLeft /></Link>
    <div className="text-xl">{title}</div>
  </div>
}

export function BottonNav() {
  return <div className="fixed bottom-0 left-0 w-full safe-bottom">
    <div className="max-w-md mx-auto bg-white">
      <div className="grid grid-cols-3 gap-4 px-4 py-2 border rounded-lg">
        {BOTTONNAVIGATION.map((m, index) => {
          const Icon = m.icon
          return (
            <Link to={m.url} key={index}>
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
                <span className="text-xs text-center">{m.label}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  </div>
}