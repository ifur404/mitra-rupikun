import { useOutletContext } from "@remix-run/react"
import { TAuth } from "~/lib/auth.server"
import { HeaderBack } from "./panel._index"
import { ShowAccount } from "~/components/app-sidebar"

export default function Akun() {
    const user = useOutletContext<TAuth>()

    return (
        <div>
            <HeaderBack title="Akun" />
            <ShowAccount user={user}/>
        </div>
    )
}
