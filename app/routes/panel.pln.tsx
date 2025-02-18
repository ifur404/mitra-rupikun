import { Input } from "~/components/ui/input";
import { HeaderBack } from "./panel._index";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Label } from "~/components/ui/label";
import { allowAny } from "~/lib/auth.server";
import { useMemo, useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { productTable } from "~/drizzle/schema";
import { getListDB } from "~/lib/ledger.server";
import { calculateProfit, CardProduct, formatValue, pickKeys, ProcessBayar } from "./panel.pulsa";
import { processDigi } from "~/lib/process.server";
import { formatCurrency } from "~/components/InputCurrency";

const DIGIFLAZZ_KEY = "PLN"

export async function loader(req: LoaderFunctionArgs) {
    const _ = await allowAny(req)
    const product = await getListDB(req.context.cloudflare.env, DIGIFLAZZ_KEY)
    return {
        data: product
    }
}

export async function action(req: ActionFunctionArgs) {
    const user = await allowAny(req)
    const formData = await req.request.formData()
    const form = JSON.parse(formData.get("json")?.toString() || '') as TFormPLN
    const res = await processDigi(req.context.cloudflare.env, user, form, 'pln')
    return res
}

export type TFormPLN = {
    customer_no: string;
    product: typeof productTable.$inferSelect | null;
}

export default function PanelPulsa() {
    const loaderData = useLoaderData<typeof loader>()
    const [form, setForm] = useState<TFormPLN>({
        customer_no: "",
        product: null
    })
    const mitra_sell = useMemo(() => {
        if (!form.product) return 0
        const { mitra_sell } = calculateProfit(form.product)
        return mitra_sell
    }, [form.product])

    return <div className="space-y-4 text-sm">
        <HeaderBack title={DIGIFLAZZ_KEY} />

        <div className="space-y-2 p-4 rounded-lg border">
            <div>
                <Label htmlFor="customer_no">No. Meter/ID Pel</Label>
                <div className="flex gap-2 items-center">
                    <Input name="customer_no" value={form.customer_no} onChange={(e) => {
                        setForm(cur => ({ ...cur, customer_no: e.target.value }))
                    }} placeholder="contoh: 14488987581" />
                </div>
            </div>
        </div>

        <div className="space-y-4">
            {loaderData.data.map((e) => {
                return <CardProduct key={e.code} data={e} active={form.product?.code === e.data?.buyer_sku_code} setForm={setForm} />
            })}
        </div>

        <ProcessBayar total={mitra_sell}>
            <input name="intent" value="intent" hidden readOnly />
            <input name="json" value={JSON.stringify(form)} hidden readOnly />

            {Object.entries(pickKeys(form.product || {}, ['name', 'code'] as any)).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-gray-200 py-2">
                    <span className="text-gray-600">{key.split("_").join(" ")}</span>
                    <span className="text-gray-900 font-medium">
                        {formatValue(key, value)}
                    </span>
                </div>
            ))}

            <div className="flex justify-between border-b border-gray-200 py-2">
                <span className="text-gray-600">Price</span>
                <span className="text-gray-900 font-medium">
                    {formatCurrency(mitra_sell.toString())}
                </span>
            </div>

        </ProcessBayar>

    </div >
}
