import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import sessionCookie from "~/lib/auth.server";

export async function loader(req: LoaderFunctionArgs) {
    const cookie = sessionCookie(req.context.cloudflare.env)
    throw redirect("/", {
      headers: {
        "Set-Cookie": await cookie.serialize("", {
          maxAge: 0,
        }),
      }
    })
}

export default function logout() {
  return (
    <div>Loading...</div>
  )
}
