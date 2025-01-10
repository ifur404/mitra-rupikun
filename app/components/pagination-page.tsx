import { TData } from "~/lib/type/global";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "./ui/pagination";
import { cn } from "~/lib/utils";

export type PaginationPage<T> = Pick<TData<T>, "page"> & {
    onChangePage: (n: number) => void
}

export function PaginationPage<T>({ page, onChangePage }: PaginationPage<T>) {
    if(page.total===0) return null

    return <Pagination>
        <PaginationContent>
            <PaginationItem>
                <PaginationPrevious
                    className={cn(page.page === 1 ? "cursor-not-allowed" : "cursor-pointer")}
                    onClick={() => {
                        if (page.page === 1) return
                        onChangePage(page.page - 1)
                    }}
                >
                    Previous
                </PaginationPrevious>
            </PaginationItem>

            {[...Array(page.pages)].map((_, i) => {
                const currentPage = page.page;
                const maxPageItems = 4;

                // Calculate the range to display around the current page
                const start = Math.max(currentPage - maxPageItems, 0);
                const end = Math.min(currentPage + maxPageItems, page.pages - 1);

                if (i < start || i > end) return null;

                return (
                    <PaginationItem key={i}>
                        <PaginationLink
                            onClick={() => {
                                if(currentPage === i + 1) return 
                                onChangePage(i + 1);
                            }}
                            className={currentPage === i + 1 ? "cursor-not-allowed border" : "cursor-pointer"}
                        >
                            {i + 1}
                        </PaginationLink>
                    </PaginationItem>
                );
            })}

            <PaginationItem>
                <PaginationNext
                    onClick={() => {
                        if (page.page === page.pages) return
                        onChangePage(page.page + 1)
                    }}
                >
                    Next
                </PaginationNext>
            </PaginationItem>
        </PaginationContent>
    </Pagination>
}