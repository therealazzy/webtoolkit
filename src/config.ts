import "dotenv/config";

const rawPublicBaseUrl = process.env.PUBLIC_BASE_URL;

if(!rawPublicBaseUrl){
    throw new Error("PUBLIC_BASE_URL is not defined!!!");
}

new URL(rawPublicBaseUrl);

export const PUBLIC_BASE_URL = rawPublicBaseUrl.replace(/\/$/, "");