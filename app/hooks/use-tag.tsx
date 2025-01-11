import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";

export default function useTags(product_id:number) {
    const fetcher = useFetcher<{ id: number, tag: number; tag_name: string }[]>({ key: `tags_${product_id}` })

    useEffect(() => {
        if (fetcher.data !== undefined) return
        fetcher.load(`/api/master/producttags?product_id=${product_id}`)
    }, [product_id])

    return {
        fetcher
    }
}
