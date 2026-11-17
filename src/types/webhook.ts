import { IncomingHttpHeaders } from "node:http";
import { Request } from "express";

export type CapturedRequest = {
    method: string;
    headers: IncomingHttpHeaders;
    queryParams: Request["query"];
    body: Buffer;
    contentType: string | undefined;
};