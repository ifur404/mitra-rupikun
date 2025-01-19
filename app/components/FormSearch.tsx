import { useSearchParams } from "@remix-run/react"
import { Search } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ReactNode } from "react"

export default function FormSearch({action}:{action:ReactNode}) {
    const [params, setParams] = useSearchParams()

    return <div className="flex flex-col md:flex-row justify-between gap-4 ">
        <form className="flex space-x-2" onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            formData.append("page", "1")
            const searchParams = new URLSearchParams(
                formData as unknown as Record<string, string>,
            ).toString();
            setParams(new URLSearchParams(searchParams))
        }}>
            <Input name="search" placeholder="Cari..." defaultValue={params.get("search") || ''} />
            <Button><Search /></Button>
        </form>
        {action}
    </div>
}
