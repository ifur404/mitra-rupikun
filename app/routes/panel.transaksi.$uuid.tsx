import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { BottonNav, HeaderBack } from "./panel._index";
import { allowAny } from "~/lib/auth.server";
import { db } from "~/drizzle/client.server";
import { eq } from "drizzle-orm";
import { ledgerTable } from "~/drizzle/schema";
import { TDataLedger } from "./panel.transaksi._index";
import { formatValue, pickKeys } from "./panel.pulsa";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { LedgerTypeEnum } from "~/data/enum";
import { Check, Loader2, XCircle } from "lucide-react";
import { useLiveLoader } from "~/hooks/use-live-loader";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { sendIpurNotification } from "~/lib/telegram";

export async function loader(req: LoaderFunctionArgs) {
    const user = await allowAny(req)
    const { uuid } = req.params
    const mydb = db(req.context.cloudflare.env.DB)
    const transaction = await mydb.query.ledgerTable.findFirst({
        where: eq(ledgerTable.uuid, uuid?.toString() || '')
    })
    if (!transaction) throw new Response(null, {
        status: 404,
        statusText: "Not Found",
    });

    return {
        uuid: uuid || '',
        user,
        transaction
    }
}

export async function action(req: ActionFunctionArgs) {
    const user = await allowAny(req)
    const { uuid } = req.params
    const mydb = db(req.context.cloudflare.env.DB)
    const transaction = await mydb.query.ledgerTable.findFirst({
        where: eq(ledgerTable.uuid, uuid?.toString() || '')
    })
    if (!transaction) throw new Response(null, {
        status: 404,
        statusText: "Not Found",
    });

    const formData = await req.request.formData()
    const datanya = {
        ...transaction?.data,
        complain: formData.get('complain')?.toString() || ''
    }
    await mydb.update(ledgerTable).set({
        data: datanya
    }).where(eq(ledgerTable.id, transaction.id))

    await sendIpurNotification(`Complain \n${JSON.stringify(datanya)}`, req.context.cloudflare.env.TELEGRAM_TOKEN)
    return {
        success: true
    }
}

export default function PanelLegdger() {
    const loaderData = useLiveLoader<typeof loader>();
    const fetcher = useFetcher<typeof action>()

    useEffect(()=> {
        if(fetcher.data?.success){
            toast.success("Komplain disimpan")
        }
    },[fetcher.data?.success])
    return (
        <div className="space-y-4">
            <HeaderBack title={`Transaksi ${loaderData.uuid}`} back_to="/panel/transaksi" />

           <RenderTopUp data={loaderData.transaction.data} />
           <RenderDigiFlazz data={loaderData.transaction.data} />

            <fetcher.Form method="POST" className="p-4 rounded-lg border space-y-2">
                <Label htmlFor="Komplen">Ajukan Keluhan :</Label>
                <Textarea placeholder="Komplen...." name="complain" defaultValue={loaderData.transaction.data?.complain || ''}/>
                <div className="flex justify-center items-center">
                    <Button type="submit">Submit</Button>
                </div>
            </fetcher.Form>
            <BottonNav />
        </div>
    )
}

function RenderTopUp({ data }: { data: TDataLedger | null }) {
    if(data?.topup){
        return <div className="p-4 rounded-lg border">
            {Object.entries(data?.topup || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-gray-200 py-2">
                    <span className="text-gray-600">{key.split("_").join(" ")}</span>
                    <span className="text-gray-900 font-medium">
                        {formatValue(key, value)}
                    </span>
                </div>
            ))}
        </div>
    }
    return null
}

function RenderDigiFlazz({ data }: { data: TDataLedger | null }) {
    if(!data) return null
    if(!Object.keys(data).some(e=> ['pulsa', 'games','e-money'].includes(e.toLowerCase()))) return null
    if (data.response?.status === "Gagal" && !("done" in data)) {
        return <div className="p-4 rounded-lg border">
            {Object.entries(pickKeys(data.response, ['customer_no', 'buyer_sku_code', 'message', 'status', 'price'])).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-gray-200 py-2">
                    <span className="text-gray-600">{key.split("_").join(" ")}</span>
                    <span className="text-gray-900 font-medium">
                        {formatValue(key, value)}
                    </span>
                </div>
            ))}
        </div>
    }

    if (data.response?.status === "Pending" && !data.webhook) {
        return <>
            <div className="flex items-end justify-center h-20 mt-2">
                <div className="flex justify-center gap-2 items-center flex-col">
                    <Loader2 className="animate-spin" size={50} />
                    <p>harap tunggu.....</p>
                </div>
            </div>

            <div className="p-4 rounded-lg border">
                {Object.entries(pickKeys(data.response, ['customer_no', 'buyer_sku_code', 'message', 'status', 'price'])).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-600">{key.split("_").join(" ")}</span>
                        <span className="text-gray-900 font-medium">
                            {formatValue(key, value)}
                        </span>
                    </div>
                ))}
            </div>
        </>
    }

    if (data?.webhook) {
        return <>
            <div className="flex items-end justify-center h-20 mt-2">
                <div className="flex justify-center gap-2 items-center flex-col">
                    {data.webhook?.status === "Sukses" ?
                        <Check size={50} className="animate-bounce " />
                        :
                        <XCircle size={50} className="animate-bounce " />
                    }
                </div>
            </div>

            <div className="p-4 rounded-lg border">
                {Object.entries(pickKeys(data.webhook, ['customer_no', 'buyer_sku_code', 'message', 'sn', 'price'])).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-600">{key.split("_").join(" ")}</span>
                        <span className="text-gray-900 font-medium">
                            {formatValue(key, value)}
                        </span>
                    </div>
                ))}
            </div>
        </>
    }

    return null
}