import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { db } from "~/drizzle/client.server";
import { webhookTable } from "~/drizzle/schema";

export async function action({ request, context }: ActionFunctionArgs) {
    const timestamp = new Date().toISOString();
    const headers = Object.fromEntries(request.headers.entries());
    const contentType = request.headers.get("Content-Type");

    const clientIp = headers["cf-connecting-ip"] || headers["x-forwarded-for"] || "unknown";

    let formData = {};
    if (contentType === "application/x-www-form-urlencoded" || contentType?.includes("multipart/form-data")) {
        const parsedFormData = Object.fromEntries(await request.formData());
        formData = parsedFormData;
    } else {
        formData = await request.json() as any;
    }

    const webhookPayload = {
        formdata: formData,
        headers: headers,
        timestamp,
        clientIp,
    };

    await db(context.cloudflare.env.DB).insert(webhookTable).values({
        data: JSON.stringify(webhookPayload),
    });

    return Response.json({ success: true });
}

export async function loader(req:LoaderFunctionArgs) {
    return Response.json({"status": "ok"})
}