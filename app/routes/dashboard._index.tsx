import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Wallet } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { onlyStaff } from "~/lib/auth.server";
import { Digiflazz } from "~/lib/digiflazz.server";
import { sumProfitUser, sumTotalMutation } from "~/lib/ledger.server";

export async function loader(req: LoaderFunctionArgs) {
  const user = await onlyStaff(req)

  const keyKV = "saldo"
  let saldo = 0
  // await req.context.cloudflare.env.KV.delete(keyKV)
  // console.log(req.context.cloudflare.env)
  const cache = await req.context.cloudflare.env.KV.get(keyKV)
  if (cache) {
    saldo = Number(cache) || 0
  } else {
    const { DIGI_USERNAME, DIGI_APIKEY } = req.context.cloudflare.env
    const d = new Digiflazz(DIGI_USERNAME, DIGI_APIKEY)
    saldo = await d.getSaldo()
    await req.context.cloudflare.env.KV.put(keyKV, saldo.toString(), {
      expirationTtl: 60
    })
  }
  return {
    saldo,
    profit: await sumProfitUser(req.context.cloudflare.env) || 0,
    mutasi: await sumTotalMutation(req.context.cloudflare.env) || 0
  }
}

export default function DashboardAdmin() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">

      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Mutasi</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Rp {loaderData.mutasi.toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-muted-foreground">
            Jumlah perputaran transaksi
          </p>
        </CardContent>
      </Card>
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profit</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Rp {loaderData.profit.toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-muted-foreground">
            Total profit APP
          </p>
        </CardContent>
      </Card>
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sisa Saldo </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Rp {loaderData.saldo.toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-muted-foreground">
            Saldo tersedia untuk digunakan
          </p>
        </CardContent>
      </Card>

    </div>
  )
}
