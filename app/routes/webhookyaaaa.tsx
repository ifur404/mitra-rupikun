import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { db } from "~/drizzle/client.server";
import { webhookTable } from "~/drizzle/schema";

export async function loader(req: LoaderFunctionArgs) {
    const timestamp = new Date().toISOString(); // Current timestamp
    const headers = Object.fromEntries(req.request.headers.entries());

    const webhookPayload = {
        formdata: Object.fromEntries(await req.request.formData()),
        headers: headers,
        timestamp
    };

    await db(req.context.cloudflare.env.DB).insert(webhookTable).values({
        data: JSON.stringify(webhookPayload), 
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
}