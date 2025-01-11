import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent } from "~/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { truncateString } from "~/lib/string";

const max = 100
export default function OpenDetail({ str }: { str: string }) {
    if (str.length < max) return <span>{str}</span>
    return <Popover>
        <PopoverTrigger asChild>
            <button className="inline-flex items-center text-start">{truncateString(str, max)} <ChevronDown className="ml-2" /></button>
        </PopoverTrigger>
        <PopoverContent className="w-96 max-h-96 overflow-auto">
            {str}
        </PopoverContent>
    </Popover>
}