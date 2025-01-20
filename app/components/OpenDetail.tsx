import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent } from "~/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { truncateString } from "~/lib/string";
import { Textarea } from "./ui/textarea";
import { cn } from "~/lib/utils";
import { useIsMobile } from "~/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";

const max = 100
export default function OpenDetail({ str, view = "text" }: { str: string; view?: "textarea" | "text" }) {
    const isMobile = useIsMobile()
    if (str.length < max) return <span>{str}</span>

    if (isMobile) {
        return <Drawer>
            <DrawerTrigger asChild>
                <button className="inline-flex items-center text-start">{truncateString(str, max)} <ChevronDown className="ml-2" /></button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="p-4">
                    {view === "text" ? <p>{str}</p> : <Textarea rows={20} defaultValue={str} />}
                </div>
            </DrawerContent>
        </Drawer>
    }

    return <Popover>
        <PopoverTrigger asChild>
            <button className="inline-flex items-center text-start">{truncateString(str, max)} <ChevronDown className="ml-2" /></button>
        </PopoverTrigger>
        <PopoverContent className={cn(view === "text" ? "w-96 max-h-96 overflow-auto" : "w-96")}>
            {view === "text" ? <p>{str}</p> : <Textarea rows={20} defaultValue={str} />}
        </PopoverContent>
    </Popover>
}