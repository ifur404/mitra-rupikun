import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { ReactNode, useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { useFetcher } from "@remix-run/react";
import { toast } from "sonner";

export default function SheetAction({ triger, title, children, keyReq="ADD_DATA" }: { triger: ReactNode, title: string, children: ReactNode, keyReq?:string }) {
    const [show, setShow] = useState(false)
    const fetcher = useFetcher<{error?:any; success: true}>({key:keyReq})
    const loading = fetcher.state !== "idle"

    function toggleShow(){
        setShow(cur=> !cur)
    }

    useEffect(() => {
        if (fetcher.state === "idle") {
            if(fetcher.data?.success){
                toggleShow()
            }
            if(fetcher.data?.error){
                toast.error("Failed")
            }
        }
      }, [fetcher.state]);

    return <Sheet open={show} onOpenChange={toggleShow}>
        <SheetTrigger asChild>
            {triger}
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col h-full p-0 gap-2">
            <SheetHeader className="border-b px-4 pt-2">
                <SheetTitle>{title}</SheetTitle>
                <SheetDescription></SheetDescription>
            </SheetHeader>
            <fetcher.Form className="flex flex-col h-full" method="POST">
                <ScrollArea className="flex-1">
                    <div className="px-4 space-y-2">
                        {children}
                    </div>
                </ScrollArea>
                <SheetFooter className="p-4">
                    <Button type="submit" className="w-full" disabled={loading}>{loading ? "Loading..." : "Submit"}</Button>
                </SheetFooter>
            </fetcher.Form>
        </SheetContent>
    </Sheet>
}
