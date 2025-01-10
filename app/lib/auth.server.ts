import { Cookie, createCookie, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";

export type TAuth = {
  id: number;
  name: string;
  email: string;
  picture: string | null;
  is_staff: boolean;
  groups: string[]
}

let _sessionStorage: Cookie;
export default function sessionCookie(env: Env) {
  if (_sessionStorage) return _sessionStorage;

  _sessionStorage = createCookie("auth", {
    secrets: [env.SESSION_SECRETS],
    // 30 days
    maxAge: 30 * 24 * 60 * 60,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return _sessionStorage
}


export async function allowAny(req: LoaderFunctionArgs) {
  const session = sessionCookie(req.context.cloudflare.env)
  const user:TAuth | undefined = await session.parse(req.request.headers.get("Cookie"))
  if(!user || !session) throw redirect('/login')
  return user
}

export async function onlyGroups(req: LoaderFunctionArgs, groups:string[]){
  const session = sessionCookie(req.context.cloudflare.env)
  const user: TAuth | undefined = await session.parse(req.request.headers.get("Cookie"))
  if(!user || !session) throw redirect('/login')
  if(!groups.some(element => user.groups.includes(element))) throw redirect('/login')
  return user
}

export async function onlyStaff(req: LoaderFunctionArgs){
  const session = sessionCookie(req.context.cloudflare.env)
  const user: TAuth|undefined = await session.parse(req.request.headers.get("Cookie")) 
  if(!user || !session || !user.is_staff) throw redirect('/login')
  return user
}
