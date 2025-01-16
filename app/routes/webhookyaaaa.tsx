import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { db } from "~/drizzle/client.server";
import { ledgerTable, webhookTable } from "~/drizzle/schema";
import { TWebhookData } from "~/lib/digiflazz";
import crypto from 'node:crypto';
import { eq } from "drizzle-orm";
import { CACHE_KEYS } from "~/data/cache";

function CheckSignature(body: string, sign: string, secret: string) {
    const signature = crypto
        .createHmac("sha1", secret)
        .update(body)
        .digest("hex");

    if (sign === signature) {
        return [true, signature]
    }
    return [false, signature]
}

export async function action(req: ActionFunctionArgs) {
    const rawBody = await req.request.text();
    const receivedSignature = req.request.headers.get("X-Hub-Signature") as string;
    const [isValid, signature] = CheckSignature(rawBody, req.context.cloudflare.env.SECRET_DIGIFLAZZ, receivedSignature)
    const { data } = JSON.parse(rawBody) as { data: TWebhookData };

    const timestamp = new Date().toISOString();
    const headers = Object.fromEntries(req.request.headers.entries());
    const clientIp = headers["cf-connecting-ip"] || headers["x-forwarded-for"] || "unknown";

    const webhookPayload = {
        formdata: data,
        headers: headers,
        timestamp,
        clientIp,
    };
    const mydb = db(req.context.cloudflare.env.DB)

    await mydb.insert(webhookTable).values({
        data: JSON.stringify(webhookPayload),
    });

    if (data.ref_id) {
        const ledger = await mydb.query.ledgerTable.findFirst({
            where: eq(ledgerTable.uuid, data.ref_id)
        })

        let last_data = {}
        try {
            last_data = JSON.parse(ledger?.data || "{}") as any
        } catch (error) {
            
        }

        await mydb.update(ledgerTable).set({
            data: JSON.stringify({
                ...last_data,
                done: webhookPayload.formdata,
                webhook_detail: {
                    headers: webhookPayload.headers,
                    timestamp: webhookPayload.timestamp,
                    clientIp: webhookPayload.clientIp,
                    signature,
                    isValid
                }
            })
        }).where(eq(ledgerTable.uuid, data.ref_id))

        await req.context.cloudflare.env.KV.put(CACHE_KEYS.SALDO_GLOBAL, data.buyer_last_saldo.toString(), {
            expirationTtl: 60
        })
    }

    return Response.json({ status: "success", message: "Webhook received" });
}

export async function loader(req: LoaderFunctionArgs) {
    return Response.json({ "status": "ok" })
}
