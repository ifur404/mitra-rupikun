import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { db } from "~/drizzle/client.server";
import { ledgerTable, webhookTable } from "~/drizzle/schema";
import { TWebhookData } from "~/lib/digiflazz.server";
import { eq } from "drizzle-orm";
import { emitter } from "~/lib/emitter.server";
import { sendIpurNotification } from "~/lib/telegram.server";
import { refundTransaction } from "~/lib/ledger.server";
const crypto = globalThis.crypto;
// function CheckSignature(body: string, sign: string, secret: string) {
//     const signature = crypto
//         .createHmac("sha1", secret)
//         .update(body)
//         .digest("hex");

//     if (sign === signature) {
//         return [true, signature]
//     }
//     return [false, signature]
// }

export async function CheckSignature(
    body: string,
    sign: string,
    secret: string
): Promise<[boolean, string]> {
    // Encode the request body and secret as Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(body);
    const keyData = encoder.encode(secret);

    // Import the secret as an HMAC key with SHA-1
    const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: { name: "SHA-1" } },
        false,
        ["sign"]
    );

    // Sign the body
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, data);

    // Convert the resulting ArrayBuffer to a hex string
    const byteArray = new Uint8Array(signatureBuffer);
    let computedHex = "";
    for (let i = 0; i < byteArray.length; i++) {
        computedHex += byteArray[i].toString(16).padStart(2, "0");
    }

    const expectedSignature = `sha1=${computedHex}`;

    return [(sign === expectedSignature), expectedSignature]
}

export async function action(req: ActionFunctionArgs) {
    const rawBody = await req.request.text();
    const receivedSignature = req.request.headers.get("X-Hub-Signature") as string;
    const [isValid, signature] = await CheckSignature(rawBody, req.context.cloudflare.env.SECRET_DIGIFLAZZ, receivedSignature)
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
        data: webhookPayload,
    });

    if (data.ref_id) {
        const ledger = await mydb.query.ledgerTable.findFirst({
            where: eq(ledgerTable.uuid, data.ref_id)
        })

        await mydb.update(ledgerTable).set({
            data: {
                ...ledger?.data,
                webhook: webhookPayload.formdata,
                webhook_detail: {
                    headers: webhookPayload.headers,
                    timestamp: webhookPayload.timestamp,
                    clientIp: webhookPayload.clientIp,
                    signature,
                    isValid
                }
            }
        }).where(eq(ledgerTable.uuid, data.ref_id))

        // await req.context.cloudflare.env.KV.put(CACHE_KEYS.SALDO_GLOBAL, data.buyer_last_saldo.toString(), {
        //     expirationTtl: 60
        // })

        if(webhookPayload.formdata.status === "Gagal"){
            await refundTransaction(req.context.cloudflare.env, ledger)
        }

        await sendIpurNotification(`Webhook \n${JSON.stringify(webhookPayload.formdata, null, "\t")}`, req.context.cloudflare.env.TELEGRAM_TOKEN)
        emitter.emit("/");
        emitter.emit(`/panel/transaksi/${data.ref_id}`);
    }

    return Response.json({ status: "success", message: "Webhook received" });
}

export default function WebhookIndex(){
    return <div>Work!</div>
}