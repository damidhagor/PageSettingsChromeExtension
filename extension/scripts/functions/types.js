function isString(obj) {
    return typeof obj === "string";
}
function isBoolean(obj) {
    return typeof obj === "boolean";
}
function isHostnameValid(hostname) {
    return hostname !== undefined && hostname !== null && hostname !== "";
}
