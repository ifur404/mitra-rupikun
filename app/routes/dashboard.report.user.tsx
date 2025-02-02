import { data, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { ClientLoaderFunctionArgs, useLoaderData, useParams, useSearchParams } from "@remix-run/react";
import { and, between, eq, getTableColumns, like, or } from "drizzle-orm";
import { Label } from "~/components/ui/label";
import { db } from "~/drizzle/client.server";
import { ledgerTable } from "~/drizzle/schema";
import { onlyStaff } from "~/lib/auth.server";
import { sqlFilterBackend } from "~/lib/query.server";
import { CHOICE_TYPE_LEDGER, hasKeysInJson } from "./dashboard.ledger";
import { ComboBoxAsync } from "~/components/combo-box-async";
import { SetStateAction, Suspense, useEffect, useMemo, useState } from "react";
import { TSelectPick } from "~/lib/type/global";
import { DatePickerWithRange } from "~/components/date-pick-range";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { formatCurrency } from "~/components/InputCurrency";


export async function loader(req: LoaderFunctionArgs) {
    const user = await onlyStaff(req)
    const url = new URL(req.request.url);
    const search = url.searchParams;

    const mydb = db(req.context.cloudflare.env.DB);
    const filter = sqlFilterBackend(url, 'created_at desc');
    const mytable = ledgerTable;
    const allColumns = getTableColumns(mytable);
    const searchableFields = [mytable.data];

    // Trim keys to remove whitespace and split correctly
    const datakey = ['emoney', 'pulsa', 'games'];
    const user_id = search.get("user_id")?.toString() || user.id.toString()
    const from = Number(search.get("from"))
    const to = Number(search.get("to"))

    const where = and(
        eq(mytable.key, user_id as any),
        between(mytable.created_at, from, to),
        hasKeysInJson(mytable.data, datakey),
        or(...searchableFields.map((c) => like(c, `%${filter.search}%`)))?.if(filter.search)
    );
    const data = await mydb
        .select({ ...allColumns }).from(mytable)
        .where(where)
        .limit(filter.limit)
        .offset(filter.offset)
        .orderBy(filter.ordering);


    return {
        data,
        user: {
            label: user.name,
            value: user.id.toString()
        }
    }
}


export default function dashboardreportuser() {
    const loaderData = useLoaderData<typeof loader>()
    const [params, setParams] = useSearchParams()
    const [user, setUser] = useState<TSelectPick | undefined>(loaderData?.user || undefined)
    const [range, setRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 7),
        to: new Date(),
    })

    function calculate(key?: any) {
        const d = (key ? loaderData.data.filter((e: any) => e.data[key] ? true : false) : loaderData.data).filter(e=>e.data?.webhook?.status==="Sukses")
        const totalSales = d.reduce((a, b) => a + (b.data?.calculate?.price_sell || 0), 0)
        const totalProfit = d.reduce((a, b) => a + (b.data?.calculate?.profit || 0), 0)
        return {
            totalSales,
            totalProfit
        }
    }

    const cal = calculate()

    useEffect(() => {
        setParams({limit:"10000",user_id: user?.value || '', from: range?.from?.getTime().toString() || '', to: range?.to?.getTime().toString() || ''})
    }, [user, range])

    return (
        <div className="space-y-8 mx-4 md:mx-0">
            <div className="space-y-2">
                <div>
                    <Label htmlFor="user">User</Label>
                    <ComboBoxAsync name={"user"} pathApi={"/api/user"} value={user} setValue={setUser} />
                </div>
                <div>
                    <Label htmlFor="date_range">Date Range</Label>
                    <DatePickerWithRange value={range} setValue={setRange} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(cal.totalSales.toString())}</div>
                        <div className="text-sm">{formatCurrency(cal.totalProfit.toString())}</div>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {CHOICE_TYPE_LEDGER.filter(e => e.isService).map((e, i) => {
                    const cal = calculate(e.value)
                    return <Card key={e.value}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{e.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(cal.totalSales.toString())}</div>
                            <div className="text-sm">{formatCurrency(cal.totalProfit.toString())}</div>
                        </CardContent>
                    </Card>
                })}
            </div>
        </div>
    )
}

export async function clientLoader({
    request,
    params,
    serverLoader,
}: ClientLoaderFunctionArgs) {
    return await serverLoader()
}
clientLoader.hydrate = true;

export function HydrateFallback() {
    return null
}