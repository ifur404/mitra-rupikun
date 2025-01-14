import { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { allowAny } from "~/lib/auth.server";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

export async function loader(req: LoaderFunctionArgs) {
  const user = allowAny(req)
  return user
}

export const meta: MetaFunction = () => {
  return [
    { title: "Panel" },
  ];
};



export default function PanelLayout() {
  const user = useLoaderData<typeof loader>()
  return (
    <div className="max-w-md mx-auto p-4 text-sm mb-20">
      <Outlet context={user}/>
    </div>
  )
}

