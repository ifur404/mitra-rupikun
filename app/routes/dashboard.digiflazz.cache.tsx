import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { CACHE_KEYS } from "~/data/cache";
import { onlyStaff } from "~/lib/auth.server";

export async function action(req: ActionFunctionArgs) {
    const user = await onlyStaff(req)
    const formData = await req.request.formData()
    const { KV } = req.context.cloudflare.env

    const key = formData.get("key") as string
    await KV.delete(key)
    return {
        success: true
    }
}

// export async function loader(req: LoaderFunctionArgs) {
//     const user = await onlyStaff(req)
//     const {KV} = req.context.cloudflare.env

//     return {
//         keys: [
//             k
//         ]
//     }
// }

export default function dashboarddigiflazzcache() {
    const fetcher = useFetcher<typeof action>()

    function handleClick(e: string) {
        const formData = new FormData()
        formData.append("key", e)
        fetcher.submit(formData, {
            method: "POST"
        })
    }

    useEffect(()=> {
        if(fetcher.data?.success){
            toast.success("Success", {position: 'top-center'})
        }
    },[fetcher.data])

    return (
        <div className="space-y-4">
            <h1>Cache </h1>

            <div className="flex gap-4">
                {Object.keys(CACHE_KEYS).map((e) => {
                    return <Button key={e} onClick={() => {
                        handleClick(e)
                    }}>{e}</Button>
                })}
            </div>
        </div>
    )
}
