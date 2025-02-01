import { redirect } from "@remix-run/cloudflare";
import { eq, desc } from "drizzle-orm";
import { db } from "~/drizzle/client.server";
import { productTable, ledgerTable } from "~/drizzle/schema";
import { calculateProfit } from "~/routes/panel.pulsa";
import { TAuth } from "./auth.server";
import { Digiflazz } from "./digiflazz";


export async function processDigi(env: Env, user: TAuth, form: any, key_form: 'pulsa' | 'emoney' | 'games' | 'pln' ="pulsa") {
    const { DIGI_USERNAME, DIGI_APIKEY, WEBHOOK_URL, NODE_ENV, DB } = env;
    const mydb = db(DB);
    const product = await mydb.query.productTable.findFirst({
        where: eq(productTable.code, form.product?.code || '')
    });
    if (!product) throw new Error("Error");

    const saldo = await mydb.query.ledgerTable.findFirst({
        where: eq(ledgerTable.key, user.id.toString()),
        orderBy: desc(ledgerTable.created_at)
    });

    if (saldo) {
        const calculate = calculateProfit(product);

        if (saldo.after > calculate.mitra_sell) {
            const digiflazz = new Digiflazz(DIGI_USERNAME, DIGI_APIKEY);
            const response = await digiflazz.processTransactionPulsa({
                sku: product.code,
                customer_no: form?.customer_no || form?.game_id,
                webhook_url: WEBHOOK_URL,
                isProd: NODE_ENV === "production",
            });

            if(response.status==="Gagal"){
                return { error: response.message, };
            }

            const transaction = await mydb.insert(ledgerTable).values({
                uuid: response.ref_id,
                before: saldo.after,
                mutation: calculate.mitra_sell,
                after: saldo.after - calculate.mitra_sell,
                key: user.id.toString(),
                created_by: user.id,
                created_at: new Date().getTime(),
                data: {
                    [key_form]: form,
                    response,
                    calculate,
                },
            }).returning({ uuid: ledgerTable.uuid });
            throw redirect(`/panel/transaksi/${transaction[0].uuid}`);
        }
        return { error: "Saldo tidak cukup, silahkan topup terlebih dahulu", };
    }
    throw new Error("Failed");
}
