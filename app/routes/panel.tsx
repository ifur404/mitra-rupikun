import { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { allowAny } from "~/lib/auth.server";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Home, List, User } from "lucide-react";

export async function loader(req: LoaderFunctionArgs) {
  const user = allowAny(req)
  return user
}

export const meta: MetaFunction = () => {
  return [
    { title: "Panel" },
  ];
};


const BOTTONNAVIGATION = [
  { icon: Home, label: "Home" },
  { icon: List, label: "Transaksi" },
  { icon: User, label: "Akun" },
]

export default function PanelLayout() {
  const user = useLoaderData<typeof loader>()
  return (
    <div className="max-w-md mx-auto min-h-screen p-4 relative">

      <Outlet context={user}/>
      <div className="absolute bottom-0 left-0 w-full">
        <div className="grid grid-cols-3 gap-4 px-4 py-2 border rounded-lg">
          {BOTTONNAVIGATION.map((m, index) => {
            const Icon = m.icon
            return (
              <Link to={`/panel/${m.label.toLowerCase()}`} key={index}>
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg">
                      <Icon className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                  <span className="text-xs text-center">{m.label}</span>
                </div>
              </Link>
            )
          })}
        </div>

      </div>
    </div>
  )
}

