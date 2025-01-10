import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { allowAny } from "~/lib/auth.server";

export async function loader(req: LoaderFunctionArgs) {
    const user = await allowAny(req)
    return null
}

export default function adminindex() {
  return (
    <div>
        
    </div>
  )
}
