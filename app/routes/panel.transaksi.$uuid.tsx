import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { BottonNav, HeaderBack } from "./panel._index";
import { allowAny } from "~/lib/auth.server";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/drizzle/client.server";
import { eq } from "drizzle-orm";
import { ledgerTable } from "~/drizzle/schema";
import { TDataLedger } from "./panel.transaksi._index";
import { formatValue, pickKeys } from "./panel.pulsa";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

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
    const loaderData = useLoaderData<typeof loader>()
    const status:any = "done" in loaderData.transaction.data ? loaderData.transaction.data.done : loaderData.transaction.data.response
    const data = pickKeys(status, ['customer_no','buyer_sku_code','message','sn','price'])
    return (
        <div className="space-y-4">
            <HeaderBack title={`Transaksi ${loaderData.uuid}`} back_to="/panel/transaksi" />
            <div className="p-4 rounded-lg border">
                {Object.entries(data).map(([key, value]) => (
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
