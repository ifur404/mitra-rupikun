import { json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/cloudflare";
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { GithubIcon, TwitterIcon } from "lucide-react"
import { toast } from "sonner";
import { Link, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import sessionCookie, { TAuth } from "~/lib/auth.server";
import { db } from "~/drizzle/client.server";
import { getAccountInfo } from "~/lib/google.server";
import { userTable } from "~/drizzle/schema";

export const meta: MetaFunction = () => {
    return [
        { title: "Masuk Akun | Ujian" },
    ];
};

const redirectSuccess = "/dashboard"

export async function loader(req: LoaderFunctionArgs) {
    const cookie = sessionCookie(req.context.cloudflare.env)
    const url = new URL(req.request.url)
    const searchParams = url.searchParams
    const code = searchParams.get("code") || ""
    const mydb = db(req.context.cloudflare.env.DB)

    const res = {
        GOOGLE_CLIENT_ID: req.context.cloudflare.env.GOOGLE_CLIENT_ID,
        GOOGLE_REDIRECT_URL: req.context.cloudflare.env.GOOGLE_REDIRECT_URL,
        url_next: url.searchParams.get("url_next") || "",
        detail: "",
        code,
    }

    const session = await cookie.parse(req.request.headers.get("Cookie"));

    if (session?.id) {
        throw redirect(redirectSuccess);
    }

    const redirect_url = req.context.cloudflare.env.GOOGLE_REDIRECT_URL

    if (code !== "") {
        const user = await getAccountInfo(code, req.context.cloudflare.env)
        if (user?.id) {
            const userDB = await mydb.query.userTable.findFirst({
                where: eq(userTable.email, user.email)
            })

            let userCookie: TAuth;

            if (userDB) {
                userCookie = {
                    id: userDB.id,
                    name: userDB.name || "",
                    is_staff: userDB.is_staff === 1,
                    email: userDB.email,
                    picture: userDB.picture || "",
                    groups: (userDB.groups ? JSON.parse(userDB.groups) : []) as string[]
                }
            } else {
                const create = await mydb.insert(userTable).values({
                    groups: "[]",
                    name: user.name,
                    email: user.email,
                    picture: user.picture,
                    is_staff: 0,
                    created_at: new Date().getTime(),
                    updated_at: new Date().getTime()
                }).returning()
            
                userCookie = {
                    id: create[0].id,
                    name: create[0].name || "",
                    is_staff: create[0].is_staff === 1,
                    email: create[0].email,
                    picture: create[0].picture || "",
                    groups: (create[0].groups ? JSON.parse(create[0].groups) : []) as string[]
                }
            }

            throw redirect(redirectSuccess, {
                headers: {
                    "Set-Cookie": await cookie.serialize(userCookie),
                }
            })
        }

        return { ...res, detail: "Failed get user detail" }
    }

    return res
}

export default function pagelogin() {
    const data = useLoaderData<typeof loader>()

    function loginByComingSoon() {
        toast("Coming soon")
    }

    function loginByGoogle() {
        const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";

        const scope = [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ].join(" ");

        const url_next = data.url_next || "";
        const client_id = data.GOOGLE_CLIENT_ID
        const redirect_uri = data.GOOGLE_REDIRECT_URL
        const params = {
            response_type: "code",
            client_id,
            redirect_uri,
            prompt: "select_account",
            access_type: "offline",
            scope: scope,
            state: JSON.stringify({
                url_next: url_next,
            })
        } as any;

        const urlParams = new URLSearchParams(params).toString();
        window.location.href = `${googleAuthUrl}?${urlParams}`;
    }

    if (data.code !== "" && data.detail !== "") {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-lg flex flex-col gap-8 bg-white p-8 rounded-lg">
                <p className="text-2xl font-bold">{data.detail}</p>
                <Link to="/login"><Button>Kembali </Button></Link>
            </div>
        </div>
    }

    return <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                <CardDescription className="text-center">
                    Choose your preferred social login method
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {data.detail !== "" && <p className="text-red-500">
                </p>
                }
                <div className="grid gap-4">
                    <Button variant="outline" className="w-full" onClick={loginByGoogle}>
                        <svg
                            className="mr-2 h-4 w-4"
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fab"
                            data-icon="google"
                            role="img"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 488 512"
                        >
                            <path
                                fill="currentColor"
                                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                            ></path>
                        </svg>
                        Lanjutkan dengan Google
                    </Button>
                    <Button variant="outline" className="w-full" onClick={loginByComingSoon}>
                        <GithubIcon className="mr-2 h-4 w-4" />
                        Lanjutkan dengan GitHub
                    </Button>
                    <Button variant="outline" className="w-full" onClick={loginByComingSoon}>
                        <TwitterIcon className="mr-2 h-4 w-4" />
                        Lanjutkan dengan Twitter
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
}

