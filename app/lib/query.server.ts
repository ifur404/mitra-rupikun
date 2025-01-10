export function sqlPagination(url: URL): {
    page: number; limit: number;
    offset: number; search?: string | null
} {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search')
    const offset = (page - 1) * limit;

    return {
        page,
        limit,
        offset,
        search
    }
}
