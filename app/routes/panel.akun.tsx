import { useFetcher, useLoaderData } from "@remix-run/react"
import { allowAny } from "~/lib/auth.server"
import { BottonNav, HeaderBack } from "./panel._index"
import { ShowAccount } from "~/components/app-sidebar"
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { MessageCircle } from "lucide-react"
import { Button } from "~/components/ui/button"
import { db } from "~/drizzle/client.server"
import { eq } from "drizzle-orm"
import { TTelegramNotif, userTable } from "~/drizzle/schema"
import { HashGenerator } from "~/lib/hash"
import { checkMessage, getTelegramLastID, sendMessage, setTelegramLastID } from "~/lib/telegram.server"
import { Switch } from "~/components/ui/switch"
import { useEffect } from "react"
import { toast } from "sonner"


export async function action(req: ActionFunctionArgs) {
    const user = await allowAny(req)
    const formData = await req.request.formData()
    const intent = formData.get("intent")
    const mydb = db(req.context.cloudflare.env.DB)

    if (intent === "user_id") {
        return {
            hash_id: new HashGenerator(req.context.cloudflare.env.SESSION_SECRETS).createHash(user.id)
        }
    }
    if (intent === "cek") {
        const user_id = formData.get("user_id")
        const lastupdateID = await getTelegramLastID(req.context.cloudflare.env)
        const messages = await checkMessage(req.context.cloudflare.env.TELEGRAM_TOKEN, lastupdateID)
        const find = messages.find(e => e.message?.text === user_id)
        if (!find) {
            return {
                error: "Tidak ada message dengan kode tersebut"
            }
        }
        const hash_id = new HashGenerator(req.context.cloudflare.env.SESSION_SECRETS).createHash(user.id)
        if (find.message?.text !== hash_id) {
            return {
                error: "Hash tidak cocok"
            }
        }

        const telegram: TTelegramNotif = {
            username: find.message.from.username || '',
            user_id: find.message.from.id || 0,
            first_name: find.message.from.first_name || '',
            hash_id: hash_id,
            services: [
                {
                    code: "notif_transaksi",
                    name: "Transaksi",
                    isActive: true,
                }
            ],
            created_at: find.update_id,
        }
        await mydb.update(userTable).set({
            telegram
        }).where(eq(userTable.id, user.id))


        const message = `Notifikasi Telegram berhasil diaktifkan`
        await sendMessage(
            req.context.cloudflare.env.TELEGRAM_TOKEN,
            find.message.from.id,
            message,
        )

        return {
            success: true
        }
    }
    if (intent === "delete") {

        const userdb = await mydb.query.userTable.findFirst({
            where: eq(userTable.id, user.id)
        })
        if (!userdb?.telegram) {
            return {
                error: "Telegram belum disiapkan"
            }
        }
        const message = `Telegram telah dihapus dari akun ${userdb.name}`
        await sendMessage(
            req.context.cloudflare.env.TELEGRAM_TOKEN,
            userdb.telegram.user_id,
            message,
        )
        await mydb.update(userTable).set({
            telegram: null,
        }).where(eq(userTable.id, user.id))

        return {
            success: true
        }
    }
    if (intent === "service") {
        const code = formData.get("code")?.toString()
        const value = formData.get("value")?.toString()
        const userdb = await mydb.query.userTable.findFirst({
            where: eq(userTable.id, user.id)
        })
        if (!userdb?.telegram) {
            return null
        }

        await mydb.update(userTable).set({
            telegram: {
                ...userdb.telegram, services: userdb.telegram.services.map(e => {
                    return e.code === code ? { ...e, isActive: value === "on" ? true : false } : e
                })
            }
        }).where(eq(userTable.id, user.id))
        return {
            success: true
        }
    }
    if (intent === "ping") {
        const userdb = await mydb.query.userTable.findFirst({
            where: eq(userTable.id, user.id)
        })

        if (!userdb?.telegram) {
            return null
        }
        const message = "PING"

        await sendMessage(
            req.context.cloudflare.env.TELEGRAM_TOKEN,
            userdb.telegram.user_id,
            message,
        )

        return {
            success: true
        }
    }
    return null
}

export async function loader(req: LoaderFunctionArgs) {
    const user = await allowAny(req)
    const mydb = db(req.context.cloudflare.env.DB)
    const userdb = await mydb.query.userTable.findFirst({
        where: eq(userTable.id, user.id)
    })

    return {
        user,
        telegram: userdb?.telegram,
    }
}

export default function Akun() {
    // const user = useOutletContext<TAuth>()
    const { user } = useLoaderData<typeof loader>()

    return (
        <div>
            <HeaderBack title="Akun" />
            <ShowAccount user={user} />
            <NotifikasiTelegram />
            <BottonNav />
        </div>
    )
}

function NotifikasiTelegram() {
    const { telegram } = useLoaderData<typeof loader>()
    const fetcher = useFetcher<typeof action>()

    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            // Check if the action was successful
            if (fetcher.data?.success) {
                toast.success("Success", {
                    description: "Your request was successful!",
                });
            }else if (fetcher.data?.error) {
                toast.success("Error", {
                    description: fetcher.data.error,
                });
            }
        }
    }, [fetcher.state, fetcher.data]);

    return <div className="w-full rounded-lg bg-white border">
        <div className="p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <MessageCircle className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-800">Telegram</h2>
                        <p className="text-xs text-gray-600">Notifikasi service</p>
                    </div>
                </div>
            </div>
            <div className="border-t p-2 mt-2 ">
                {!telegram ?
                    <div>
                        {fetcher.data?.hash_id ?
                            <>
                                <p>ikuti langkah langkah dibawah:</p>
                                <ol className="list-inside list-decimal text-sm">
                                    <li>Buka aplikasi <a href="https://web.telegram.org" target="_blank" className="text-primary underline">telegram.org</a> dan login dengan akun Anda.</li>
                                    <li>Pada kolom pencarian, ketik <a href="https://t.me/UpkanID_bot" target="_blank" className="text-primary underline ">@UpkanID_bot</a> dan tekan enter. Bot ini biasanya akan muncul dalam hasil pencarian. Klik pada bot tersebut untuk membuka chat</li>
                                    <li>Setelah chat dengan bot terbuka, chat verif code <code className="rounded bg-gray-800 text-white px-1">{fetcher.data?.hash_id}</code> dan kirim</li>
                                    <li>Kembali ke halaman ini dan klik Verif</li>
                                </ol>
                                <div>
                                    <img src="/assets/verif-tg.png" alt="verif telegram" className="h-10" />
                                </div>
                                <div className="flex justify-center items-center mt-2 border-t pt-2 ">
                                    <Button size="sm" onClick={() => {
                                        const formData = new FormData()
                                        formData.append("intent", "cek")
                                        formData.append("user_id", fetcher.data?.hash_id || '')
                                        fetcher.submit(formData, {
                                            action: "?id=cek",
                                            method: "POST"
                                        })
                                    }}>Verifikasi</Button>
                                </div>
                            </> : <div className="flex items-center justify-center gap-2">
                                <Button size="sm" onClick={() => {
                                    const formData = new FormData()
                                    formData.append("intent", "user_id")
                                    fetcher.submit(formData, {
                                        method: "POST"
                                    })
                                }}>Siapkan</Button></div>}
                    </div>
                    : <div>
                        <div className="w-full">
                            {telegram.services.map(e => {
                                return <div className="flex justify-between gap-2 w-full" key={e.code}>
                                    <div>{e.name}</div>
                                    <div><Switch name={e.code} defaultChecked={e.isActive} onCheckedChange={(ee) => {
                                        const formData = new FormData()
                                        formData.append("intent", "service")
                                        formData.append("code", e.code)
                                        formData.append("value", e.isActive ? 'off' : 'on')
                                        fetcher.submit(formData, {
                                            method: "POST"
                                        })
                                    }} /></div>
                                </div>
                            })}
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <Button size="sm" onClick={() => {
                                const formData = new FormData()
                                formData.append("intent", "ping")
                                fetcher.submit(formData, {
                                    method: "POST"
                                })
                            }}>Tes</Button>
                            <Button size="sm" variant="destructive" onClick={() => {
                                if (!confirm("akun telegram ini akan dihapus dari akun, yakin ?")) {
                                    return
                                }
                                const formData = new FormData()
                                formData.append("intent", "delete")
                                fetcher.submit(formData, {
                                    method: "POST"
                                })
                            }}>Hapus</Button>
                        </div>
                    </div>}
            </div>
        </div>
    </div>
}