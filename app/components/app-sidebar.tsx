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
import { Link } from "@remix-run/react"

// This is sample data.
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
      title: "Transaction",
      url: "/dashboard/transaction",
    },
    {
      title: "Master Data",
      url: "#",
      items: [
        {
          title: "Tags",
          url: "/dashboard/master/tags",
          isActive: false
        },
      ],
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
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar> & { user: TAuth }) {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader className="border-b">
        <div className="flex gap-2 px-4 py-2">
          <Avatar>
            <AvatarImage src={props.user.picture || ''} />
            <AvatarFallback>{truncateString(props.user.name, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <div>{props.user.name}</div>
            <p className="text-xs">{truncateString(props.user.email, 20)}</p>
            <Link to="/logout"> <Button size="sm" variant="outline" className="py-1 px-4 mt-2 text-xs">Logout</Button></Link>
          </div>
        </div>
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
