import { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { Link, MetaFunction, Outlet, useLoaderData, useLocation } from "@remix-run/react"
import { Suspense } from "react"
import { AppSidebar } from "~/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import { Separator } from "~/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar"
import { onlyStaff } from "~/lib/auth.server"

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard" },
  ];
};

export async function loader(req: LoaderFunctionArgs) {
  const user = onlyStaff(req)
  return user
}

function generateBreadcrumb(url: string) {
  const pathSegments = url.split('/').filter(segment => segment);

  // Create breadcrumb items
  const breadcrumb = pathSegments.map((segment, index) => {
    // Construct the URL for each breadcrumb step
    const link = '/' + pathSegments.slice(0, index + 1).join('/');
    return {
      name: segment.replace(/-/g, ' ').toUpperCase(), // Format name (optional)
      link,
    };
  });

  return breadcrumb
}

export default function AdminPage() {
  const navigation = useLocation()
  const breadcrumb = generateBreadcrumb(navigation.pathname)
  const user = useLoaderData<typeof loader>()

  return <Suspense>
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={user}/>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumb.map((crumb, index) => (
                <BreadcrumbItem key={index}>
                  <BreadcrumbPage>
                    <Link to={crumb.link}>{crumb.name}</Link>
                  </BreadcrumbPage>
                  {index < breadcrumb.length - 1 && (
                    <BreadcrumbSeparator />
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="md:p-4 px-0">
          <Outlet context={user}/>
        </div>
      </SidebarInset>
    </SidebarProvider>
  </Suspense>
}
