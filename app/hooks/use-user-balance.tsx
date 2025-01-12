import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { LedgerTypeEnum } from "~/data/enum";
import { ledgerTable } from "~/drizzle/schema";

export default function useUserBalance(user_id:number) {
    const fetcher = useFetcher<typeof ledgerTable.$inferSelect[]>({ key: `userbalance_${user_id}` })

    useEffect(() => {
        if (fetcher.data !== undefined) return
        fetcher.load(`/api/ledger?type=${LedgerTypeEnum.BALANCE_USER}&key=${user_id}`)
    }, [user_id])

    return {
        fetcher
    }
}
