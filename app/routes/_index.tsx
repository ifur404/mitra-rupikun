import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { DataTable } from "~/components/datatable";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader(req: LoaderFunctionArgs) {
  return null
}

export default function Index() {
  return (
    <div className="my-8 container mx-auto">
      <div className="text-2xl font-bold">Harga Pulsa</div>
      {/* <DataTable /> */}
    </div>
  );
}
