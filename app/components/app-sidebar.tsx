import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar"
import { TAuth } from "~/lib/auth.server"
import { truncateString } from "~/lib/string"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Link, useLocation, useNavigation } from "@remix-run/react"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
    },
    {
      title: "User",
      url: "/dashboard/user",
    },
    {
      title: "Product",
      url: "/dashboard/product",
    },
    {
      title: "Ledger",
      url: "/dashboard/ledger",
    },
   
    {
      title: "Digiflazz",
      url: "#",
      items: [
        {
          title: "Webhook",
          url: "/dashboard/digiflazz/webhook",
          isActive: false
        },
        {
          title: "Cache",
          url: "/dashboard/digiflazz/cache",
          isActive: false
        },
      ],
    },
  ],
}

export function ShowAccount({user}:{user:TAuth,}){
  const url = useLocation()

  return <div className="flex gap-2 px-4 py-2 mt-4">
  <Avatar>
      <AvatarImage src={user.picture || ''} />
      <AvatarFallback>{truncateString(user.name, 2)}</AvatarFallback>
  </Avatar>
  <div>
      <div>{user.name}</div>
      <p className="text-xs truncate">{user.email}</p>
      <div className="flex gap-2">
        <Link to="/logout"> <Button size="sm" variant="outline" className="py-1 px-4 mt-2 text-xs">Logout</Button></Link>
        {user.is_staff && url.pathname.startsWith("/panel") && (
          <Link to="/dashboard"> <Button size="sm" variant="outline" className="py-1 px-4 mt-2 text-xs">Admin</Button></Link>
        )}
        {user.is_staff && url.pathname.startsWith("/dashboard") && (
          <Link to="/panel"> <Button size="sm" variant="outline" className="py-1 px-4 mt-2 text-xs">Panel</Button></Link>
        )}
      </div>
  </div>
</div>
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar> & { user: TAuth }) {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader className="border-b">
        <ShowAccount user={props.user} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className="font-medium">
                    {item.title}
                  </a>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                    {item.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={item.isActive}>
                          <a href={item.url}>{item.title}</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
