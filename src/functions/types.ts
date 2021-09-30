interface ScrollValues {
    x: number,
    y: number
}

enum Theme {
    LightMode,
    DarkMode
}


function isScrollValues(obj: any): obj is ScrollValues {
    return "x" in obj
        && "y" in obj;
}

function isString(obj: any): obj is string {
    return typeof obj === "string";
}

function isNullableString(obj: any): obj is string | null {
    return obj === null
        || isString(obj);
}

function isBoolean(obj: any): obj is boolean {
    return typeof obj === "boolean";
}