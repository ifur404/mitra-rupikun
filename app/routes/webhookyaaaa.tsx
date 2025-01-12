import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { db } from "~/drizzle/client.server";
import { transactionTable, webhookTable } from "~/drizzle/schema";
import { CHOICE_STATUS, TWebhookData } from "~/lib/digiflazz";
import crypto from 'node:crypto';
import { eq } from "drizzle-orm";

function isValidate(body: string, sign: string, secret: string) {
    const signature = crypto
        .createHmac("sha1", secret)
        .update(body)
        .digest("hex");

    if (sign === `sha1=${signature}`) {
        return true
    }
    return false
}

export async function action(req: ActionFunctionArgs) {
    const rawBody = await req.request.text();
    const receivedSignature = req.request.headers.get("X-Hub-Signature") as string;
    const isValid = isValidate(rawBody, req.context.cloudflare.env.SECRET_DIGIFLAZZ, receivedSignature)

    if (isValid) {
        const {data} = JSON.parse(rawBody) as {data: TWebhookData};
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

        if(data.ref_id){
            await mydb.update(transactionTable).set({
                status: CHOICE_STATUS.find(e=>e.label===data.status)?.value || 4,
                updated_at: new Date().getTime(),
            }).where(eq(transactionTable.key, data.ref_id))

            await req.context.cloudflare.env.KV.put("saldo", data.buyer_last_saldo.toString(), {
                expirationTtl: 60
            })
        }

        return Response.json({ status: "success", message: "Webhook received" });
    }

    return Response.json(
        { status: "error", message: "Invalid signature" },
    );
}

export async function loader(req: LoaderFunctionArgs) {
    return Response.json({ "status": "ok" })
}
