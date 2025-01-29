import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "~/components/ui/command";
import { cn } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { PlusCircle, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { OPTION_SERVICES } from "~/routes/panel._index";
import { Button } from "./ui/button";
import { useSearchParams } from "@remix-run/react";

export default function MyFilter({
    title = "Type", datakey = 'datakey', options = OPTION_SERVICES.map((e, i) => ({ ...e, value: i.toString() }))
}: {
    title?: string,
    options?: {
        label: string
        value: string
        icon?: React.ComponentType<{ className?: string }>
    }[],
    datakey?: string
}) {
    const [params, setParams] = useSearchParams()
    const [selectedValues, setSelectedValues] = useState<string[]>([])

    useEffect(() => {
        const values = params.get(datakey)?.split(",") ?? [];
        setSelectedValues(values);
    }, [params, datakey]); // Runs when params or datakey changes

    // Function to update search params
    const updateSearchParams = (newValues: string[]) => {
        const newParams = new URLSearchParams(params);
        if (newValues.length) {
            newParams.set(datakey, newValues.join(","));
        } else {
            newParams.delete(datakey); // Remove param if empty
        }
        setParams(newParams);
    };

    // Function to update both state and search params
    const toggleSelection = (value: string) => {
        setSelectedValues((cur) => {
            const newValues = cur.includes(value)
                ? cur.filter(f => f !== value) // Remove if already selected
                : [...cur, value]; // Add if not selected

            // Update search params
            const newParams = new URLSearchParams(params);
            if (newValues.length) {
                newParams.set(datakey, newValues.join(","));
            } else {
                newParams.delete(datakey);
            }
            setParams(newParams);

            return newValues;
        });
    };

    return <Popover>
        <PopoverTrigger asChild>
            <Button variant="outline" className="border-dashed">
                <PlusCircle />
                {title}
                {selectedValues?.length > 0 && (
                    <>
                        <Separator orientation="vertical" className="mx-2 h-4" />
                        <Badge
                            variant="secondary"
                            className="rounded-sm px-1 font-normal lg:hidden"
                        >
                            {selectedValues.length}
                        </Badge>
                        <div className="hidden space-x-1 lg:flex">
                            {selectedValues.length > 2 ? (
                                <Badge
                                    variant="secondary"
                                    className="rounded-sm px-1 font-normal"
                                >
                                    {selectedValues.length} selected
                                </Badge>
                            ) : (
                                options
                                    .filter((option) => selectedValues.includes(option.value))
                                    .map((option) => (
                                        <Badge
                                            variant="secondary"
                                            key={option.value}
                                            className="rounded-sm px-1 font-normal"
                                        >
                                            {option.label}
                                        </Badge>
                                    ))
                            )}
                        </div>
                    </>
                )}
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
                <CommandInput placeholder={title} />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                        {options.map((option) => {
                            const isSelected = selectedValues.includes(option.value)
                            return (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => {
                                        toggleSelection(option.value)
                                    }}
                                >
                                    <div
                                        className={cn(
                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                            isSelected
                                                ? "bg-primary text-primary-foreground"
                                                : "opacity-50 [&_svg]:invisible"
                                        )}
                                    >
                                        <Check />
                                    </div>
                                    {option.icon && (
                                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span>{option.label}</span>
                                    {/* {facets?.get(option.value) && (
                                        <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                                            {facets.get(option.value)}
                                        </span>
                                    )} */}
                                </CommandItem>
                            )
                        })}
                    </CommandGroup>
                    {selectedValues.length > 0 && (
                        <>
                            <CommandSeparator />
                            <CommandGroup>
                                <CommandItem
                                    onSelect={() => {
                                        updateSearchParams([])
                                    }}
                                    className="justify-center text-center"
                                >
                                    Clear filters
                                </CommandItem>
                            </CommandGroup>
                        </>
                    )}
                </CommandList>
            </Command>
        </PopoverContent>
    </Popover>
}
