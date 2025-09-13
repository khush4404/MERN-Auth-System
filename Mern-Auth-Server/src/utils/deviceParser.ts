import { UAParser } from "ua-parser-js";

export const getClientDevice = (userAgent: string = ""): string => {
    const parser = new UAParser(userAgent);
    const os = parser.getOS().name || "Unknown OS";
    let browser = parser.getBrowser().name || "Unknown Browser";

    if (userAgent.includes("Brave")) {
        browser = "Brave";
    }

    return `${browser}, ${os}`;
};
