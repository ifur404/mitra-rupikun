import { Input } from "~/components/ui/input";
import { HeaderBack } from "./panel._index";
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Label } from "~/components/ui/label";
import { allowAny } from "~/lib/auth.server";
import { DigiCategory, Digiflazz, TPriceList } from "~/lib/digiflazz";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { formatCurrency } from "~/components/InputCurrency";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "~/components/ui/drawer";
import { db } from "~/drizzle/client.server";
import { desc, eq } from "drizzle-orm";
import { ledgerTable } from "~/drizzle/schema";
import { LedgerTypeEnum } from "~/data/enum";
import { toast } from "sonner";
import { CACHE_KEYS } from "~/data/cache";
import { getListDB } from "~/lib/ledger.server";

const optionMobileOperators = [
    { label: "Telkomsel", value: "telkomsel", pattern: /^(0)?(811|812|813|821|822|823|852|853)\d{5,9}$/ },
    { label: "Indosat", value: "indosat", pattern: /^(0)?(814|815|816|855|856|857|858)\d{5,9}$/ },
    { label: "Axis", value: "axis", pattern: /^(0)?(817|818|819|859|877|878|879)\d{5,9}$/ },
    { label: "Smartfren", value: "smartfren", pattern: /^(0)?(881|882|883|884|885|886|887|888|889)\d{5,9}$/ },
    { label: "Tri (3)", value: "tri", pattern: /^(0)?(895|896|897|898|899)\d{5,9}$/ },
    { label: "XL", value: "xl", pattern: /^(0)?(817|818|819|859|877|878)\d{5,9}$/ },
    { label: "by.U", value: "byu", pattern: /^(0)?(851)\d{5,9}$/ },
];

function identifyOperator(phoneNumber: string) {
    const cleaned = phoneNumber.replace(/\D/g, '');

    for (const brand of optionMobileOperators) {
        if (brand.pattern.test(cleaned)) {
            return brand;
        }
    }
    return null;
}

export async function getPricelist(env: Env, category: DigiCategory = "Pulsa", cache_key: string = CACHE_KEYS.PULSA) {
    const { DIGI_USERNAME, DIGI_APIKEY } = env
    const cache = env.KV
    const cache_data = await cache.get(cache_key)
    if (cache_data) {
        return JSON.parse(cache_data) as TPriceList[]
    }

    const digiflazz = new Digiflazz(DIGI_USERNAME, DIGI_APIKEY)
    const product = await digiflazz.priceList({
        category: category,
    })
    const p_sort = product.sort((a, b) => a.price - b.price)
    if (product.length > 0) {
        await cache.put(cache_key, JSON.stringify(p_sort), {
            expirationTtl: 60
        })
        return p_sort
    }
    return []
}



export async function loader(req: LoaderFunctionArgs) {
    const _ = await allowAny(req)
    const product = await getListDB(req.context.cloudflare.env, "Pulsa")
    return {
        data: product
    }
}

export async function action(req: ActionFunctionArgs) {
    const user = await allowAny(req)
    const { DIGI_USERNAME, DIGI_APIKEY, WEBHOOK_URL, NODE_ENV } = req.context.cloudflare.env
    const formData = await req.request.formData()
    const form = JSON.parse(formData.get("json")?.toString() || '') as TFormPulsa
    const products = await getListDB(req.context.cloudflare.env, "Pulsa")
    const product = products.find(e => e.data?.buyer_sku_code === form.product?.buyer_sku_code)
    if (!product) throw new Error("Error")
    const mydb = db(req.context.cloudflare.env.DB)
    const saldo = await mydb.query.ledgerTable.findFirst({
        where: eq(ledgerTable.key, user.id.toString()),
        orderBy: desc(ledgerTable.created_at)
    })
    if (saldo) {
        if (saldo.after > (product.price || 0)) {
            const digiflazz = new Digiflazz(DIGI_USERNAME, DIGI_APIKEY)
            const response = await digiflazz.processTransactionPulsa({
                sku: product.code,
                customer_no: form.customer_no,
                webhook_url: WEBHOOK_URL,
                isProd: NODE_ENV === "production",
            })

            const transaction = await mydb.insert(ledgerTable).values({
                uuid: response.ref_id,
                before: saldo.after,
                mutation: product.price,
                after: saldo.after - (product?.price || 0),
                key: user.id.toString(),
                created_by: user.id,
                created_at: new Date().getTime(),
                data: {
                    pulsa: form,
                    response,
                },
            }).returning({ uuid: ledgerTable.uuid })

            throw redirect(`/panel/transaksi/${transaction[0].uuid}`)
        }
        return { error: "Saldo tidak cukup, silahkan topup terlebih dahulu", }
    }

    throw new Error("Failed")
}

export type TFormPulsa = {
    customer_no: string;
    brand: typeof optionMobileOperators[0] | null;
    product: TPriceList | null
}
export default function PanelPulsa() {
    const loaderData = useLoaderData<typeof loader>()
    const [form, setForm] = useState<TFormPulsa>({
        customer_no: "",
        brand: null,
        product: null
    })

    useEffect(() => {
        if (!(form.customer_no.length > 4)) return
        const identifikasi = identifyOperator(form.customer_no)
        if (identifikasi) {
            setForm(cur => ({ ...cur, brand: identifikasi }))
        }
    }, [form.customer_no])

    return <div className="space-y-4 text-sm">
        <HeaderBack title="Pulsa" />

        <div className="space-y-2 p-4 rounded-lg border">
            <div>
                <Label htmlFor="customer_no">No tujuan : </Label>
                <div className="flex gap-2 items-center">
                    <Input name="customer_no" value={form.customer_no} onChange={(e) => {
                        setForm(cur => ({ ...cur, customer_no: e.target.value }))
                    }} placeholder="contoh: 082122012952" />
                </div>
            </div>
            <div>
                <Label htmlFor="brand">Operator : </Label>
                <Select name="brand" value={form.brand?.value} onValueChange={(v) => {
                    setForm(cur => ({ ...cur, brand: optionMobileOperators.find(e => e.value === v) || null }))
                }}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih Operator" />
                    </SelectTrigger>
                    <SelectContent>
                        {optionMobileOperators.map(e => {
                            return <SelectItem value={e.value} key={e.value}>{e.label}</SelectItem>
                        })}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="space-y-4">
            {loaderData.data.filter(e => e.data?.brand.toLowerCase() === form.brand?.value.toLowerCase()).map((e) => {
                return <div
                    key={e.code}
                    onClick={() => {
                        setForm(cur => ({ ...cur, product: e.data }))
                    }}
                    className={cn("p-4 rounded-lg cursor-pointer border-2", form.product?.buyer_sku_code === e.data?.buyer_sku_code ? "border-blue-500" : "")}
                >
                    <div>{e.name}</div>
                    <div className="flex gap-4">
                        <div className="font-extrabold">{formatCurrency(e?.price?.toString() || '')}</div>
                    </div>
                </div>
            })}
        </div>

        <ProcessBayar form={form} />

    </div >
}

function ProcessBayar({ form }: { form: TFormPulsa }) {
    const selectedKeys = ['product_name', 'category', 'brand', 'type', 'seller_name', 'price', 'buyer_sku_code'] as any;

    const fetcher = useFetcher<typeof action>()
    const loading = fetcher.state !== "idle"

    useEffect(() => {
        if (fetcher.state === "idle") {
            if (fetcher.data?.error) {
                toast.error(fetcher.data.error, {
                    position: 'top-center'
                })
            }
        }
    }, [fetcher.state]);

    function processBayar() {
        const data = new FormData();
        data.append("intent", "process")
        data.append("json", JSON.stringify(form));
        fetcher.submit(data, {
            action: '?index',
            method: "POST"
        })
    }

    return <div className="fixed bottom-0 left-0 w-full ">
        <div className="max-w-md mx-auto bg-white flex justify-between border p-4 rounded-lg">
            <div>
                <div className="text-gray-800">Total Harga</div>
                <b className="text-xl">{formatCurrency(form.product?.price.toString() || "0")}</b>
            </div>
            <div>
                <Drawer>
                    <DrawerTrigger asChild>
                        <Button>Proses Bayar</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>Apakah kamu yakin ?</DrawerTitle>
                            <DrawerDescription>Pembelian tidak dapat dibatalkan</DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4">
                            {Object.entries(pickKeys(form.product || {}, selectedKeys)).map(([key, value]) => (
                                <div key={key} className="flex justify-between border-b border-gray-200 py-2">
                                    <span className="text-gray-600">{key.split("_").join(" ")}</span>
                                    <span className="text-gray-900 font-medium">
                                        {formatValue(key, value)}
                                    </span>
                                </div>
                            ))}
                            {fetcher.data?.error && <p className="py-4 text-red-500 text-center">{fetcher.data?.error}</p>}
                            <div className="flex gap-8 justify-center mb-20 w-full mt-4">
                                <DrawerClose asChild>
                                    <Button variant="destructive" >Batal</Button>
                                </DrawerClose>
                                <Button onClick={processBayar} disabled={loading}>{loading ? "Loading..." : "Lanjutkan"}</Button>
                            </div>
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
        </div>
}

export function pickKeys<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    return keys.reduce((result, key) => {
        if (key in obj) {
            result[key] = obj[key];
        }
        return result;
    }, {} as Pick<T, K>);
}

export const formatValue = (key: string, value: any): string => {
    if (key === 'price') {
        return formatCurrency(String(value));
    }
    if (typeof value === 'boolean') {
        return value ? 'Ya' : 'Tidak';
    }
    return String(value);
};