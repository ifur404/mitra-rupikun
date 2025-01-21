import { allowAny } from "~/lib/auth.server";
import { HeaderBack } from "./panel._index";
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { formatValue, getPricelist, pickKeys } from "./panel.pulsa";
import { CACHE_KEYS } from "~/data/cache";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { ReactNode, useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { formatCurrency } from "~/components/InputCurrency";
import { Digiflazz, TPriceList } from "~/lib/digiflazz";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "~/components/ui/drawer";
import { Button } from "~/components/ui/button";
import { FileQuestion } from "lucide-react";
import { db } from "~/drizzle/client.server";
import { desc, eq } from "drizzle-orm";
import { ledgerTable } from "~/drizzle/schema";
import { LedgerTypeEnum } from "~/data/enum";
import { toast } from "sonner";
import { getListDB } from "~/lib/ledger.server";


export async function loader(req: LoaderFunctionArgs) {
    const _ = await allowAny(req)
    const product = await getListDB(req.context.cloudflare.env, "Games")
    const brand = [...new Set(product.map(e => e.data?.brand as string))].sort((a, b) => a.localeCompare(b))

    return {
        data: product,
        brand
    }

}

export async function action(req: ActionFunctionArgs) {
    const user = await allowAny(req)
    const { DIGI_USERNAME, DIGI_APIKEY, WEBHOOK_URL, NODE_ENV } = req.context.cloudflare.env
    const formData = await req.request.formData()
    const form = JSON.parse(formData.get("json")?.toString() || '') as TFormGame
    const products = await getListDB(req.context.cloudflare.env, 'Games')
    const product = products.find(e => e.code === form.product?.buyer_sku_code)
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
                customer_no: form.game_id,
                webhook_url: WEBHOOK_URL,
                isProd: NODE_ENV === "production",
            })

            const transaction = await mydb.insert(ledgerTable).values({
                uuid: response.ref_id,
                before: saldo.after,
                mutation: product.price,
                after: (saldo.after - (product.price || 0)),
                key: user.id.toString(),
                created_by: user.id,
                created_at: new Date().getTime(),
                data: {
                    games: form,
                    response: response,
                },
            }).returning({ uuid: ledgerTable.uuid })

            throw redirect(`/panel/transaksi/${transaction[0].uuid}`)
        }
        return { error: "Saldo tidak cukup, silahkan topup terlebih dahulu", }
    }

    throw new Error("Failed")
}

export type TFormGame = {
    game_id: string;
    brand: string;
    product: TPriceList | null;
}

export default function panelgame() {
    const loaderData = useLoaderData<typeof loader>()
    const [form, setForm] = useState<TFormGame>({
        game_id: "",
        brand: loaderData.brand[0] || '',
        product: null,
    })


    return (
        <div className="space-y-4 text-sm">
            <HeaderBack title="Top Up Game" />

            <div className="space-y-2 p-4 rounded-lg border">
                <div>
                    <Label htmlFor="brand">Jenis Game : </Label>
                    <Select name="brand" value={form.brand} onValueChange={(v) => {
                        setForm(cur => ({ ...cur, brand: v }))
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih Game" />
                        </SelectTrigger>
                        <SelectContent>
                            {loaderData.brand.map(e => {
                                return <SelectItem value={e} key={e}>{e}</SelectItem>
                            })}
                        </SelectContent>
                    </Select>
                </div>

                {form.brand === "MOBILE LEGENDS" ? <FormMobileLegend onChange={(d) => {
                    setForm(cur => ({ ...cur, game_id: d }))
                }} /> : <>
                    {form.brand && (
                        <>
                            <Label htmlFor="game_id">Game ID : </Label>
                            <div className="flex justify-between gap-4">
                                <Input name="game_id" value={form.game_id} onChange={(e) => {
                                    setForm(cur => ({ ...cur, game_id: e.target.value }))
                                }} placeholder="Game ID: 987654321" />

                                <OpenSample>
                                    <img src="/assets/sample_profile_freefire.png" alt="Sample Free Fire" className="w-full" />
                                    <div className="mt-8 p-8">
                                        <h1>Cara Menemukan Player ID di Free Fire</h1>
                                        <ol className="list-inside list-decimal">
                                            <li>
                                                <strong>Buka Free Fire:</strong> Jalankan aplikasi game Free Fire di perangkat Anda.
                                            </li>
                                            <li>
                                                <strong>Akses Profil Anda:</strong> Ketuk banner profil Anda yang terletak di pojok kiri atas layar utama.
                                            </li>
                                            <li>
                                                <strong>Temukan Player ID:</strong> Pada halaman profil Anda, Player ID akan ditampilkan di bawah nama pengguna Anda.
                                            </li>
                                        </ol>
                                    </div>
                                </OpenSample>
                            </div>
                        </>
                    )}
                </>}
            </div>

            <div className="space-y-4">
                {loaderData.data.filter(e => e.data?.brand === form.brand).map((e) => {
                    return <div
                        key={e.code}
                        onClick={() => {
                            setForm(cur => ({ ...cur, product: e.data }))
                        }}
                        className={cn("p-4 rounded-lg cursor-pointer border-2", form.product?.buyer_sku_code === e.code ? "border-blue-500" : "")}
                    >
                        <div>{e.name}</div>
                        <div className="flex gap-4">
                            <div className="font-extrabold">{formatCurrency(e?.price?.toString() || '0')}</div>
                        </div>
                    </div>
                })}
            </div>

            <ProcessBayar form={form} />

        </div>
    )
}

function ProcessBayar({ form }: { form: TFormGame }) {
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
                    <DrawerTrigger asChild disabled={!form.product}>
                        <Button disabled={!form.product}>Proses Bayar</Button>
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

function FormMobileLegend({ onChange }: { onChange: (d: string) => void }) {
    const [myForm, setMyForm] = useState({
        user_id: "",
        zone_id: "",
    })

    useEffect(() => {
        onChange(`${myForm.user_id}${myForm.zone_id}`)
    }, [myForm])

    return <div>
        <Label htmlFor="game_id">Game ID : </Label>
        <div className="flex justify-between gap-4">
            <Input name="user_id" value={myForm.user_id} onChange={(e) => {
                setMyForm(cur => ({ ...cur, user_id: e.target.value }))
            }} placeholder="User ID: 123456789" />
            <Input name="zone_id" value={myForm.zone_id} onChange={(e) => {
                setMyForm(cur => ({ ...cur, zone_id: e.target.value }))
            }} placeholder="Zone ID: 1234" />
            <OpenSample>
                <img src="/assets/sample_profile_ml.png" alt="Sample ML" className="w-full" />
                <div className="p-8 mt-8">
                    <h1>Cara Menemukan User ID dan Zone ID di Mobile Legends</h1>
                    <ol className="list-inside list-decimal">
                        <li>
                            <strong>Buka Mobile Legends:</strong> Jalankan aplikasi game Mobile Legends di perangkat Anda.
                        </li>
                        <li>
                            <strong>Akses Profil Anda:</strong> Ketuk avatar profil Anda yang terletak di pojok kiri atas layar utama.
                        </li>
                        <li>
                            <strong>Temukan User ID dan Zone ID:</strong> Pada halaman profil Anda, User ID dan Zone ID akan ditampilkan di bawah nama dalam game Anda.
                        </li>
                    </ol>
                </div>
            </OpenSample>
        </div>
    </div>
}

function OpenSample({ children }: { children: ReactNode }) {
    return <Drawer>
        <DrawerTrigger asChild>
            <Button type="button" variant="ghost"><FileQuestion /></Button>
        </DrawerTrigger>
        <DrawerContent>
            <DrawerHeader>
                <DrawerTitle>Contoh Game ID</DrawerTitle>
                <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <div className="min-h-40">
                {children}
            </div>
        </DrawerContent>
    </Drawer>
}