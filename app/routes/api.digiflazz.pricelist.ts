import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { onlyStaff } from "~/lib/auth.server";
import { Digiflazz } from "~/lib/digiflazz";

export async function loader(req: LoaderFunctionArgs) {
    const user = await onlyStaff(req)

    const keyKV = "pricelist-pulsa"
    // await req.context.cloudflare.env.KV.delete(keyKV)
    const cache = await req.context.cloudflare.env.KV.get(keyKV)
    if (cache) {
        return Response.json(JSON.parse(cache))
    } else {
        const { DIGI_USERNAME, DIGI_APIKEY } = req.context.cloudflare.env
        const d = new Digiflazz(DIGI_USERNAME, DIGI_APIKEY)
        const data = await d.priceList({
            category: "Pulsa"
        })
        await req.context.cloudflare.env.KV.put(keyKV, JSON.stringify(data), {
            expirationTtl: 60
        })
        return Response.json(data)
    }

}