import { Input } from "~/components/ui/input";
import { HeaderBack } from "./panel._index";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Label } from "~/components/ui/label";
import { allowAny } from "~/lib/auth.server";
import { DigiCategory, Digiflazz, TPriceList } from "~/lib/digiflazz";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dispatch, FormEvent, ReactNode, SetStateAction, useEffect, useMemo, useState } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { formatCurrency } from "~/components/InputCurrency";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "~/components/ui/drawer";
import { productTable } from "~/drizzle/schema";
import { toast } from "sonner";
import { CACHE_KEYS } from "~/data/cache";
import { getListDB } from "~/lib/ledger.server";
import { processDigi } from "~/lib/process.server";
import { isTimeNotWithinRange } from "~/lib/time";

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
    const formData = await req.request.formData()
    const form = JSON.parse(formData.get("json")?.toString() || '') as TFormPulsa
    const res = await processDigi(req.context.cloudflare.env, user, form)
    return res
}

export type TFormPulsa = {
    customer_no: string;
    brand: typeof optionMobileOperators[0] | null;
    product: typeof productTable.$inferSelect | null;
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

    const mitra_sell = useMemo(() => {
        if (!form.product) return 0
        const { mitra_sell } = calculateProfit(form.product)
        return mitra_sell
    }, [form.product])

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

export function ProcessBayar({ children, total }: { children: ReactNode, total: number }) {
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

    function processBayar(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        fetcher.submit(formData, {
            action: '?index',
            method: "POST"
        })
    }

    return <div className="fixed bottom-0 left-0 w-full ">
        <div className="max-w-md mx-auto bg-white flex justify-between border p-4 rounded-lg">
            <div>
                <div className="text-gray-800">Total Harga</div>
                <b className="text-xl">{formatCurrency(total.toFixed(0))}</b>
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
                        <form className="p-4" onSubmit={processBayar}>
                            {children}
                            {fetcher.data?.error && <p className="py-4 text-red-500 text-center">{fetcher.data?.error}</p>}
                            <div className="flex gap-8 justify-center mb-20 w-full mt-4">
                                <DrawerClose asChild>
                                    <Button variant="destructive" >Batal</Button>
                                </DrawerClose>
                                <Button type="submit" disabled={loading}>{loading ? "Loading..." : "Lanjutkan"}</Button>
                            </div>
                        </form>
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

export function calculateProfit(data: typeof productTable.$inferSelect) {
    const price_sell = data?.price || 0
    const digi = data.data?.price || 0
    const profit = price_sell - digi
    const app = Math.round(profit / 2)
    const mitra_sell = digi + app
    return {
        price_sell,
        digi,
        profit,
        app,
        mitra_sell,
    }
}

export function CardProduct({ data, active, setForm }: { data?: typeof productTable.$inferSelect; active: boolean, setForm: Dispatch<SetStateAction<any>> }) {
    if (!data) return null

    const { mitra_sell, price_sell } = calculateProfit(data)
    const isDisable = !isTimeNotWithinRange(data.data?.start_cut_off || "0:0", data.data?.end_cut_off || '0:0')
    if(isDisable) return null

    return <div
        onClick={() => {
            if(isDisable) return 
            setForm((cur: any) => ({ ...cur, product: data }))
        }}
        className={cn(
            "p-4 rounded-lg cursor-pointer border-2", 
            active ? "border-blue-500" : "",
            isDisable ? "bg-red-100 border-red-500" : ""
        )}
    >
        <div className="font-bold">{data.name}</div>
        <div className="flex gap-4 justify-between mt-1 border-t pt-1 text-xs">
            <div>{formatCurrency(mitra_sell.toFixed(0))}</div>
            {isDisable ? <div>{data.data?.start_cut_off} {data.data?.end_cut_off}</div> : <div>Rek Jual : {formatCurrency(price_sell.toFixed(0))}</div> }
        </div>
    </div>
}