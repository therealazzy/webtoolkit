export function inspectJwt(token: string) {

    const parts = token.split(".");
    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    if(parts.length !==  3){
        throw new Error("Invalid JWT structure")
    }


    return{
        header,
        payload
    };
}