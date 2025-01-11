export type TData<T> = {
    data: T[];
    page: {
        limit: number,
        offset: number,
        page: number,
        total: number,
        pages: number,
    }
}

export type TSelectPick = {
    value: string;
    label: string;
}

export type TResponse = {error: string} | {success: boolean}