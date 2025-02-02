
import { Check, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react"
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
    CommandSeparator,
} from "~/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useFetcher } from "@remix-run/react"
import { TData, TSelectPick } from "~/lib/type/global"
import { PaginationSimple } from "./pagination-page"


export function ComboBoxAsync({
    name,
    pathApi,
    value,
    setValue,
    mapData = (e: any[]) => {
        return e.map((ee, i) => ({ value: String(ee.id), label: ee.name }))
    }
}: {
    name: string, pathApi: string;
    value: TSelectPick | undefined;
    setValue: Dispatch<SetStateAction<TSelectPick | undefined>>
    mapData?: (d: any) => any
}) {
    const [open, setOpen] = useState(false)
    const isDesktop = useMediaQuery('(min-width: 768px)')

    const placeholder = value
        ? value.label
        : "Select data..."

    if (isDesktop) {
        return (
            <>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between "
                        >
                            {placeholder}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <StatusList mapData={mapData} value={value} setValue={setValue} setOpen={setOpen} pathApi={pathApi} name={name} />
                    </PopoverContent>
                </Popover>
            </>
        )
    }

    return (
        <>
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button variant="outline" className="w-full justify-between ">
                        {placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                        <StatusList mapData={mapData} value={value} setValue={setValue} setOpen={setOpen} pathApi={pathApi} name={name} />
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    )
}

function StatusList({
    value,
    setValue,
    setOpen,
    pathApi,
    name,
    mapData
}: {
    value?: TSelectPick
    setValue: Dispatch<SetStateAction<TSelectPick | undefined>>
    setOpen: (c: boolean) => void;
    pathApi: string;
    name: string;
    mapData: (d: any[]) => TSelectPick[]
}) {
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const fetcher = useFetcher<TData<TSelectPick>>({ key: `API_${name}` })
    const data = mapData(fetcher?.data?.data || [])
    const loading = fetcher.state !== "idle"

    useEffect(() => {
        fetcher.load(`${pathApi}?search=${search}&page=${page}`)
    }, [search, page, pathApi])

    return (
        <Command shouldFilter={false} >
            <CommandInput placeholder="Search..." value={search} onValueChange={setSearch} />
            <CommandList>
                {loading ? (
                    <CommandEmpty>Loading.. </CommandEmpty>
                ) : (
                    <CommandEmpty>No data found.</CommandEmpty>
                )}
                <CommandGroup>
                    {data.map((d) => (
                        <CommandItem
                            key={d.value}
                            value={d.value}
                            onSelect={(currentValue) => {
                                const exist = value?.value === d.value
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
                                    value?.value === d.value ? "opacity-100" : "opacity-0"
                                )}
                            />
                            {d.label}
                        </CommandItem>
                    ))}
                </CommandGroup>
                {fetcher?.data?.page && (<>
                    <CommandSeparator />
                    <PaginationSimple page={fetcher?.data?.page || undefined} onChangePage={e => {
                        setPage(e)
                    }} />
                </>
                )}
            </CommandList>
        </Command>
    )
}