import { allowAny } from "~/lib/auth.server";
import { BottonNav, HeaderBack } from "./panel._index";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getPricelist } from "./panel.pulsa";
import { CACHE_KEYS } from "~/data/cache";
import { useLoaderData } from "@remix-run/react";
import { ReactNode, useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { formatCurrency } from "~/components/InputCurrency";
import { Digiflazz, TPriceList } from "~/lib/digiflazz";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "~/components/ui/drawer";
import { Button } from "~/components/ui/button";
import { FileQuestion } from "lucide-react";


export async function loader(req: LoaderFunctionArgs) {
    const _ = await allowAny(req)
    const { DIGI_USERNAME, DIGI_APIKEY } = req.context.cloudflare.env
    await req.context.cloudflare.env.KV.delete(CACHE_KEYS.GAME)
    // const digiflazz = new Digiflazz(DIGI_USERNAME, DIGI_APIKEY)
    // const product = await digiflazz.priceList({
    //     category: "Games",
    // })
    // console.log(product)
    const product = await getPricelist(req.context.cloudflare.env, "Games", CACHE_KEYS.GAME)

    const brand = [...new Set(product.map(e => e.brand))].sort((a,b)=> a.localeCompare(b))

    return {
        data: product,
        brand
    }

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
                    {!form.brand && (
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
                                        <ol>
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
                {loaderData.data.filter(e => e.brand === form.brand).map((e) => {
                    return <div
                        key={e.buyer_sku_code}
                        onClick={() => {
                            setForm(cur => ({ ...cur, product: e }))
                        }}
                        className={cn("p-4 rounded-lg cursor-pointer border-2", form.product?.buyer_sku_code === e.buyer_sku_code ? "border-blue-500" : "")}
                    >
                        <div>{e.product_name} - {e.seller_name}</div>
                        <div className="flex gap-4">
                            <div className="font-extrabold">{formatCurrency(e?.price.toString())}</div>
                        </div>
                    </div>
                })}
            </div>

            <BottonNav />
        </div>
    )
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
                    <ol>
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