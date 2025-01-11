
import { Check, ChevronsUpDown } from "lucide-react"
import { useMediaQuery } from 'usehooks-ts'
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "~/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover"
import { useEffect, useState } from "react"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer"
import { truncateString } from "~/lib/string"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useFetcher } from "@remix-run/react"
import { TData, TSelectPick } from "~/lib/type/global"


export function ComboBox({ name, pathApi, defaultValue }: { name: string, pathApi: string; defaultValue?: TSelectPick}) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState<TSelectPick | undefined>(defaultValue)
    const fetcher = useFetcher<TData<TSelectPick>>({ key: `API_${name}` })
    const isDesktop = useMediaQuery('(min-width: 768px)')

    const placeholder = value
        ? value.label
        : "Select data..."
    const data = fetcher?.data?.data || []

    useEffect(() => {
        if (open) {
            fetcher.load(pathApi)
        }
    }, [open])
    

    if (isDesktop) {
        return (
            <>
                <input value={value?.value || ''} name={name} hidden readOnly />
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                        >
                            {placeholder}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <StatusList value={value} setValue={setValue} data={data} setOpen={setOpen}/>
                    </PopoverContent>
                </Popover>
            </>
        )
    }

    return (
        <>
            <input value={value?.value || ''} name={name} hidden readOnly />
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                        {placeholder}
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <VisuallyHidden>
                        <DrawerHeader>
                            <DrawerTitle>Select an Option</DrawerTitle>
                            <DrawerDescription>Use the combobox below to select an option from the list.</DrawerDescription>
                        </DrawerHeader>
                    </VisuallyHidden>
                    <div className="mt-4 border-t h-[50vh]">
                        <StatusList value={value} setValue={setValue} data={data} setOpen={setOpen}/>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    )
}

function StatusList({
    value,
    setValue,
    data = [],
    setOpen
}: {
    value?: TSelectPick
    setValue: React.Dispatch<React.SetStateAction<TSelectPick | undefined>>
    data: TSelectPick[],
    setOpen: (c: boolean)=> void
}) {
    return (
        <Command>
            <CommandInput placeholder="Search framework..." />
            <CommandList>
                <CommandEmpty>No data found.</CommandEmpty>
                <CommandGroup>
                    {data.map((d) => (
                        <CommandItem
                            key={d.value}
                            value={d.value}
                            onSelect={(currentValue) => {
                                const exist = value?.value === d.value.toString()
                                if (exist) {
                                    setValue(undefined)
                                } else {
                                    setValue(d)
                                    setOpen(false)
                                }
                            }}
                        >
                            <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    value?.value === d.value.toString() ? "opacity-100" : "opacity-0"
                                )}
                            />
                            {d.label}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    )
}