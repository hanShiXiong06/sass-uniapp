export function inArray(elem: any, arr: string | any[] | null) { 
    return arr == null ? -1 : arr.indexOf(elem);
}
