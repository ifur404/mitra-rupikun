import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { ColumnDef } from "@tanstack/react-table";
import { and, eq, or, like, sql, desc, getTableColumns, inArray, placeholder } from "drizzle-orm";
import { ChevronsUpDown, Edit, Loader, Plus, Trash } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { ActionDelete } from "~/components/ActionDelete";
import { DataTable } from "~/components/datatable";
import FormSearch from "~/components/FormSearch";
import InputCurrency, { convertCurrencyToDecimal, formatCurrency } from "~/components/InputCurrency";
import { MultiComboBox } from "~/components/multi-combobox";
import { PaginationPage } from "~/components/pagination-page";
import SheetAction from "~/components/SheetAction";
import { Button } from "~/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "~/components/ui/drawer";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { db } from "~/drizzle/client.server";
import { productTable, productTagTable } from "~/drizzle/schema";
import useTags from "~/hooks/use-tag";
import { onlyStaff } from "~/lib/auth.server";
import { sqlPagination } from "~/lib/query.server";
import { dateFormat } from "~/lib/time";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { TDataProvider, TPriceList } from "~/lib/digiflazz";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command";
import { TResponse } from "~/lib/type/global";

export async function loader(req: LoaderFunctionArgs) {
  const user = await onlyStaff(req)
  const url = new URL(req.request.url)
  const mydb = db(req.context.cloudflare.env.DB)
  const filter = sqlPagination(url)
  const search = url.searchParams
  const mytable = productTable
  const searchableFields = [mytable.name]

  const where = and(
    and(
      or(...searchableFields.map((c) => like(c, `%${filter.search}%`)))?.if(filter.search)
    )
  )
  const total = await mydb.select({
    totalCount: sql<number>`COUNT(*)`.as("totalCount"),
  }).from(mytable).where(where)

  const data = await mydb
    .select({ ...getTableColumns(mytable) }).from(mytable)
    .where(where)
    .limit(filter.limit)
    .offset(filter.offset)
    .orderBy(desc(mytable.updated_at))

  return {
    data: data,
    page: {
      limit: filter.limit,
      offset: filter.offset,
      page: filter.page,
      total: total[0].totalCount,
      pages: Math.ceil(total[0].totalCount / filter.limit),
    },
  }
}

export async function action(req: ActionFunctionArgs) {
  const user = await onlyStaff(req)
  const formData = await req.request.formData()

  const mydb = db(req.context.cloudflare.env.DB)
  const intent = formData.get("intent")

  try {
    if (intent === "ADD_DATA") {
      const data = Object.fromEntries(formData)
      const d = await mydb.insert(productTable).values({
        ...data,
        price: convertCurrencyToDecimal(formData.get("price")?.toString() || "0"),
        price_sell: convertCurrencyToDecimal(formData.get("price_sell")?.toString() || "0"),
        created_by: user.id,
        updated_by: user.id,
      }).returning({ id: productTable.id })

      const tags = (data?.tags as string).split(",")
      if (tags.length > 0) {
        const values = tags.map(e => ({ product_id: d[0].id, tag_id: Number(e) }))
        await mydb.insert(productTagTable).values(values)
      }
      return {
        success: true
      }
    }


    if (intent === "EDIT_DATA") {
      const data = Object.fromEntries(formData)
      const id = Number(data.id)
      await mydb.update(productTable).set({
        ...data,
        price: convertCurrencyToDecimal(formData.get("price")?.toString() || "0"),
        price_sell: convertCurrencyToDecimal(formData.get("price_sell")?.toString() || "0"),
        updated_by: user.id,
        updated_at: new Date().getTime(),
      }).where(eq(productTable.id, id))
      if (!data?.tags) {
        await mydb
          .delete(productTagTable)
          .where(
            eq(productTagTable.product_id, id),
          );
        return { success: true }
      }

      // Fetch existing tags for the product
      const existingTags = await mydb
        .select({ tag_id: productTagTable.tag_id }).from(productTagTable)
        .where(eq(productTagTable.product_id, id));

      // Convert existing tag IDs to a set for quick lookup
      const existingTagIds = new Set(existingTags.map(tag => tag.tag_id));

      // Split and parse incoming tags
      const tags = ((data?.tags || '') as string).split(",").map(Number);

      // Determine tags to add (new tags)
      const tagsToAdd = tags.filter(tagId => !existingTagIds.has(tagId));

      // Determine tags to remove (no longer in the incoming tags)
      const tagsToRemove = existingTags
        .filter(tag => !tags.includes(tag.tag_id as number))
        .map(tag => tag.tag_id as number);

      if (tagsToRemove.length > 0) {
        await mydb
          .delete(productTagTable)
          .where(
            and(
              eq(productTagTable.product_id, id),
              inArray(productTagTable.tag_id, tagsToRemove)
            )
          );
      }

      // Insert only the new tags
      if (tagsToAdd.length > 0) {
        const values = tagsToAdd.map(tagId => ({ product_id: id, tag_id: tagId }));
        await mydb.insert(productTagTable).values(values);
      }

      return {
        success: true
      }
    }

    if (intent === "DELETE") {
      const id = Number(formData.get("id"))
      await mydb.delete(productTable).where(eq(productTable.id, id))
      return {
        success: true
      }
    }

    if (intent === "UPDATE_DATA") {
      const id = Number(formData.get("id"))
      await mydb.update(productTable).set({
        data: JSON.stringify(JSON.parse(formData.get("data") as string)),
        updated_at: new Date().getTime(),
        updated_by: user.id,
      }).where(eq(productTable.id, id))

      return {
        success: true
      }
    }
  } catch (error) {
  }
  return { error: "Failed" }
}

type TData = typeof productTable.$inferSelect
const collums: ColumnDef<TData>[] = [
  {
    cell: (d) => <div className="flex gap-2">
      <ButtonEdit data={d.row.original} />
      <ActionDelete id={d.row.original.id}>
        <Button size="sm"><Trash size={20} /></Button>
      </ActionDelete>
    </div>,
    header: "Action"
  },
  {
    id: "id",
    accessorKey: 'id',
    header: "ID"
  },
  {
    id: "name",
    accessorKey: 'name',
    header: "Name"
  },
  {
    id: "price",
    accessorFn: (d) => formatCurrency(d?.price?.toString() || "0"),
    header: "Price"
  },
  {
    id: "price_sell",
    accessorFn: (d) => formatCurrency(d?.price_sell?.toString() || "0"),
    header: "Price Sell"
  },
  {
    cell: (d) => <ShowTags data={d.row.original} />,
    header: "Tags"
  },
  {
    cell: (d) => <ShowProvider data={d.row.original} />,
    header: "Provider"
  },
  {
    id: "created_at",
    accessorFn: (d) => dateFormat(new Date(d.created_at || 0)),
    header: "CreatedAt"
  },
  {
    id: "updated_at",
    accessorFn: (d) => dateFormat(new Date(d.updated_at || 0)),
    header: "UpdatedAt"
  },
]


export default function DashboardProduct() {
  const loadData = useLoaderData<typeof loader>()
  const [params, setParams] = useSearchParams()

  return (
    <div className="space-y-4">
      <div className="text-2xl font-bold">Product</div>
      <FormSearch action={<>
        <AddData />
      </>} />
      <DataTable data={loadData.data} columns={collums} />

      <PaginationPage page={loadData.page} onChangePage={(e) => {
        setParams((prev) => {
          const p = new URLSearchParams(prev)
          p.set("page", e.toString())
          return p
        }, {
          preventScrollReset: true,
        });
      }} />
    </div>
  )
}


const initialProvider: TDataProvider = {
  from: "digiflazz",
  digiflazz: undefined,
}
function ShowProvider({ data }: { data: TData }) {
  const defaultP = data.data ? JSON.parse(data.data) as TDataProvider : initialProvider
  const fetcher = useFetcher<TPriceList[]>({ key: `provider_${data.id}` })
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<TPriceList | undefined>(defaultP?.digiflazz)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const placeholder = `${defaultP.digiflazz?.product_name || ''} - ${defaultP.digiflazz?.seller_name}`

  useEffect(() => {
    if (open && fetcher.data === undefined) {
      fetcher.load("/api/digiflazz/pricelist")
    }
  }, [open])

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <p>{placeholder}</p>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <FormProvider product={fetcher.data} value={value} setValue={setValue} id={data.id} />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {placeholder}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <VisuallyHidden>
          <DrawerHeader>
            <DrawerTitle>Option provider</DrawerTitle>
            <DrawerDescription>pilih product paling sesuai</DrawerDescription>
          </DrawerHeader>
        </VisuallyHidden>
        <div className="mt-4 border-t h-[50vh]">
          <FormProvider product={fetcher.data} value={value} setValue={setValue} id={data.id} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function FormProvider({ product = [], value, setValue, id }: { product?: TPriceList[], value?: TPriceList, setValue: Dispatch<SetStateAction<TPriceList | undefined>>; id: number }) {
  const fetcher_update = useFetcher<TResponse>({ key: `update_provider_${id}` })

  function handleUpdate(selected?: TPriceList) {
    const formData = new FormData()
    formData.append("intent", "UPDATE_DATA")
    formData.append("id", id.toString())
    formData.append("data", selected ? JSON.stringify({
      ...initialProvider,
      digiflazz: selected
    }) : "")
    fetcher_update.submit(formData, {
      method: "POST"
    })
  }

  return <>
    <Command filter={(v, s, k) => {
      if (v.toLocaleLowerCase().includes(s.toLocaleLowerCase())) {
        return 1
      }
      return 0
    }}>
      <CommandInput placeholder="Pilih product" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {product.map((d) => (
            <CommandItem
              key={d.buyer_sku_code}
              value={d.product_name}
              onSelect={(v) => {
                if (value?.buyer_sku_code === d.buyer_sku_code) {
                  setValue(undefined)
                  handleUpdate(undefined)
                } else {
                  handleUpdate(d)
                  setValue(d)
                }
              }}
            >
              <div>
                <b>{d.product_name}</b>
                <p className="text-xs">{formatCurrency(d.price.toString())} - {d.seller_name}</p>

              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  </>
}

function ButtonEdit({ data }: { data: TData }) {
  const { fetcher } = useTags(data.id)

  return <SheetAction keyReq={`EDIT_${data.id}`} title="Edit Data" triger={<Button size="sm"><Edit size={20} /></Button>}>
    <input name="intent" value="EDIT_DATA" hidden readOnly />
    <input name="id" value={data.id} hidden readOnly />
    <RenderForm data={data} />
    <div>
      <Label htmlFor="tags">Tags</Label>
      <div>
        <MultiComboBox name="tags" pathApi={"/api/master/tags?type=pulsa"} defaultValue={fetcher.data?.map(e => ({ value: e.tag.toString(), label: e.tag_name }))} />
      </div>
    </div>
  </SheetAction>
}

function RenderForm({ data }: { data?: TData }) {
  return <>
    <div>
      <Label htmlFor="name">Name</Label>
      <Input name="name" placeholder="Name" defaultValue={data?.name || ''} />
    </div>
    <div>
      <Label htmlFor="price">Price</Label>
      <InputCurrency name="price" id="price" defaultValue={data?.price?.toString() || '0'} />
    </div>
    <div>
      <Label htmlFor="price_sell">Price Sell</Label>
      <InputCurrency name="price_sell" id="price_sell" defaultValue={data?.price_sell?.toString() || '0'} />
    </div>
  </>
}

function AddData() {
  return <SheetAction title="Add Data" triger={<Button><Plus /> Add Data</Button>}>
    <input name="intent" value="ADD_DATA" hidden readOnly />
    <RenderForm />
    <div>
      <Label htmlFor="tags">Tags</Label>
      <div>
        <MultiComboBox name="tags" pathApi={"/api/master/tags?type=pulsa"} />
      </div>
    </div>

  </SheetAction>
}

function ShowTags({ data }: { data: TData }) {
  const { fetcher } = useTags(data.id)
  if (fetcher.state !== "idle") return <span><Loader className="animate-spin" size={20} /></span>
  return <span>{fetcher.data?.map(e => e.tag_name).join(", ")}</span>
}