import { Input } from "~/components/ui/input";
import { HeaderBack } from "./panel._index";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Label } from "~/components/ui/label";
import { allowAny } from "~/lib/auth.server";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useMemo, useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { productTable } from "~/drizzle/schema";
import { getListDB } from "~/lib/ledger.server";
import { calculateProfit, CardProduct, formatValue, pickKeys, ProcessBayar } from "./panel.pulsa";
import { processDigi } from "~/lib/process.server";

const OPTION_EMONEY = [
    { label: "Dana", value: "Dana", },
    { label: "Ovo", value: "Ovo", },
    { label: "Go Pay", value: "Go Pay", },
];

const DIGIFLAZZ_KEY = "E-Money"


export async function loader(req: LoaderFunctionArgs) {
    const _ = await allowAny(req)
    const product = await getListDB(req.context.cloudflare.env, DIGIFLAZZ_KEY)
    return {
        data: product
    }
}

// export async function action(req: ActionFunctionArgs) {
//     const user = await allowAny(req)
//     const { DIGI_USERNAME, DIGI_APIKEY, WEBHOOK_URL, NODE_ENV } = req.context.cloudflare.env
//     const formData = await req.request.formData()
//     const form = JSON.parse(formData.get("json")?.toString() || '') as TFormEmoney
//     const products = await getListDB(req.context.cloudflare.env, DIGIFLAZZ_KEY)
//     const product = products.find(e => e.data?.buyer_sku_code === form.product?.code)
//     if (!product) throw new Error("Error")
//     const mydb = db(req.context.cloudflare.env.DB)
//     const saldo = await mydb.query.ledgerTable.findFirst({
//         where: eq(ledgerTable.key, user.id.toString()),
//         orderBy: desc(ledgerTable.created_at)
//     })
//     if (saldo) {
//         if (saldo.after > (product.price || 0)) {
//             const digiflazz = new Digiflazz(DIGI_USERNAME, DIGI_APIKEY)
//             const response = await digiflazz.processTransactionPulsa({
//                 sku: product.code,
//                 customer_no: form.customer_no,
//                 webhook_url: WEBHOOK_URL,
//                 isProd: NODE_ENV === "production",
//             })

//             const transaction = await mydb.insert(ledgerTable).values({
//                 uuid: response.ref_id,
//                 before: saldo.after,
//                 mutation: product.price,
//                 after: saldo.after - (product?.price || 0),
//                 key: user.id.toString(),
//                 created_by: user.id,
//                 created_at: new Date().getTime(),
//                 data: {
//                     emoney: form,
//                     response,
//                 },
//             }).returning({ uuid: ledgerTable.uuid })

//             throw redirect(`/panel/transaksi/${transaction[0].uuid}`)
//         }
//         return { error: "Saldo tidak cukup, silahkan topup terlebih dahulu", }
//     }

//     throw new Error("Failed")
// }

export async function action(req: ActionFunctionArgs) {
    const user = await allowAny(req)
    const formData = await req.request.formData()
    const form = JSON.parse(formData.get("json")?.toString() || '') as TFormEmoney
    const res = await processDigi(req.context.cloudflare.env, user, form)
    return res
}

export type TFormEmoney = {
    customer_no: string;
    brand: typeof OPTION_EMONEY[0] | null;
    product: typeof productTable.$inferSelect | null;
}

export default function PanelPulsa() {
    const loaderData = useLoaderData<typeof loader>()
    const [form, setForm] = useState<TFormEmoney>({
        customer_no: "",
        brand: OPTION_EMONEY[0],
        product: null
    })
    const mitra_sell = useMemo(() => {
        if (!form.product) return 0
        const { mitra_sell } = calculateProfit(form.product)
        return mitra_sell
    }, [form.product])

    return <div className="space-y-4 text-sm">
        <HeaderBack title="E-Money" />

        <div className="space-y-2 p-4 rounded-lg border">
            <div>
                <Label htmlFor="brand">Brand : </Label>
                <Select name="brand" value={form.brand?.value} onValueChange={(v) => {
                    setForm(cur => ({ ...cur, brand: OPTION_EMONEY.find(e => e.value === v) || null }))
                }}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih Operator" />
                    </SelectTrigger>
                    <SelectContent>
                        {OPTION_EMONEY.map(e => {
                            return <SelectItem value={e.value} key={e.value}>{e.label}</SelectItem>
                        })}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="customer_no">No tujuan : </Label>
                <div className="flex gap-2 items-center">
                    <Input name="customer_no" value={form.customer_no} onChange={(e) => {
                        setForm(cur => ({ ...cur, customer_no: e.target.value }))
                    }} placeholder="contoh: 082122012952" />
                </div>
            </div>
        </div>

        <div className="space-y-4">
            {loaderData.data.filter(e => e.data?.brand.toLowerCase() === form.brand?.value?.toLowerCase()).map((e) => {
                return <CardProduct key={e.code} data={e} active={form.product?.code === e.data?.buyer_sku_code} setForm={setForm} />
            })}
        </div>

        <ProcessBayar total={mitra_sell}>
            <input name="intent" value="intent" hidden readOnly />
            <input name="json" value={JSON.stringify(form)} hidden readOnly />

            {Object.entries(pickKeys(form.product || {}, ['name', 'code', 'price'] as any)).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-gray-200 py-2">
                    <span className="text-gray-600">{key.split("_").join(" ")}</span>
                    <span className="text-gray-900 font-medium">
                        {formatValue(key, value)}
                    </span>
                </div>
            ))}

        </ProcessBayar>

    </div >
}
