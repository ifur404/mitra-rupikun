import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Wallet } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { allowAny, onlyStaff } from "~/lib/auth.server";
import { Digiflazz } from "~/lib/digiflazz";

export async function loader(req: LoaderFunctionArgs) {
  const user = await onlyStaff(req)
 
  const keyKV = "saldo"
  let saldo = 0
  const cache = await req.context.cloudflare.env.KV.get(keyKV)
  if(cache){
    saldo = Number(cache) || 0
  }else{
    const {DIGI_USERNAME, DIGI_APIKEY} = req.context.cloudflare.env
    const d = new Digiflazz(DIGI_USERNAME, DIGI_APIKEY)
    saldo = await d.getSaldo()
    await req.context.cloudflare.env.KV.put(keyKV, saldo.toString())
  }
  return {
    saldo
  }
}

export default function DashboardAdmin() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <div>
      <Card className="w-full max-w-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Sisa Saldo</CardTitle>
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
