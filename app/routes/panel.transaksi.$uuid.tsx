import { LoaderFunctionArgs } from "@remix-run/cloudflare";
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
import { formatCurrency } from "~/components/InputCurrency";
import { Check, CircleX, Loader2 } from "lucide-react";
import { TResponseTransaction } from "~/lib/digiflazz";
import { useLiveLoader } from "~/hooks/use-live-loader";
import { useEffect } from "react";

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
        transaction: {...transaction, data: JSON.parse(transaction.data || '') as TDataLedger}
    }
}

export default function PanelLegdger() {
    const loaderData = useLiveLoader<typeof loader>();
    useEffect(()=> {
        console.log(loaderData)
    },[loaderData])
    
    let status:any =  {}
    if([LedgerTypeEnum.BALANCE_USER, LedgerTypeEnum.TOPUP].includes(loaderData.transaction.type)){
        status = {
            id: loaderData.transaction.uuid,
            jumlah: `+${formatCurrency(loaderData.transaction.mutation?.toString() || "0")}`,
            created_at: new Date(loaderData.transaction.created_at || 0)?.toLocaleString("id-ID"),
            ...loaderData.transaction.data,
        }
    }
    if (loaderData.transaction.type === LedgerTypeEnum.PURCHASE){
        status = "done" in loaderData.transaction.data ? loaderData.transaction.data.done : loaderData.transaction.data.response
    }
    
    return (
        <div className="space-y-4">
            <HeaderBack title={`Transaksi ${loaderData.uuid}`} back_to="/panel/transaksi" />

            <div className="flex items-end justify-center h-20 mt-2">
                <div className="flex justify-center gap-2 items-center flex-col">
                    {!("done" in loaderData.transaction.data) ? (
                        <>
                            <Loader2 className="animate-spin" size={50}/>
                            <p>harap tunggu.....</p>
                        </>
                    ) : (
                        <>
                            {(status as TResponseTransaction).status === "Sukses" ? 
                            <Check size={50} className="animate-bounce "/>
                            : <CircleX size={50} className="animate-bounce " />}
                        </>
                    )}
                </div>
            </div>

            <div className="p-4 rounded-lg border">
                {Object.entries(pickKeys(status, ['customer_no','buyer_sku_code','message','sn','price'])).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-600">{key.split("_").join(" ")}</span>
                        <span className="text-gray-900 font-medium">
                            {formatValue(key, value)}
                        </span>
                    </div>
                ))}
            </div>
            <div className="p-4 rounded-lg border space-y-2">
                <Label htmlFor="complain">Ajukan Keluhan :</Label>
                <Textarea placeholder="Complain...." name="complain"/>
                <div className="flex justify-center items-center">
                    <Button>Submit</Button>
                </div>
            </div>
            <BottonNav />
        </div>
    )
}
