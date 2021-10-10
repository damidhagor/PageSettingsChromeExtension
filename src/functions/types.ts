function isString(obj: any): obj is string {
    return typeof obj === "string";
}

function isBoolean(obj: any): obj is boolean {
    return typeof obj === "boolean";
}

function isHostnameValid(hostname: string | null | undefined): boolean {
    return hostname !== undefined && hostname !== null && hostname !== "";
}