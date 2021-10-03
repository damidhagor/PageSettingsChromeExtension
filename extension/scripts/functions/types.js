var Theme;
(function (Theme) {
    Theme[Theme["LightMode"] = 0] = "LightMode";
    Theme[Theme["DarkMode"] = 1] = "DarkMode";
})(Theme || (Theme = {}));
function isScrollValues(obj) {
    return "x" in obj
        && "y" in obj;
}
function isString(obj) {
    return typeof obj === "string";
}
function isNullableString(obj) {
    return obj === null
        || isString(obj);
}
function isBoolean(obj) {
    return typeof obj === "boolean";
}
function isHostnameValid(hostname) {
    return hostname !== undefined && hostname !== null && hostname !== "";
}
