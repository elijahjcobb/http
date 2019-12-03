/**
 * Copyright 2019
 *
 * Elijah Cobb
 * elijah@elijahcobb.com
 * https://github.com/elijahjcobb
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * ORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */
/// <reference types="node" />
import * as FS from "fs";
import { HRequest } from "./HRequest";
import * as HTTP from "http";
import { HFileSendOptions } from "./HFileSendOptions";
export declare class HResponse {
    private readonly headers;
    private readonly res;
    private statusCode;
    private startWrite;
    constructor(req: HRequest, res: HTTP.ServerResponse);
    private setHeaders;
    private setLengthHeader;
    private setTypeHeader;
    setStatusCode(value: number): void;
    setHeader(key: string, value: string | number): void;
    sendFile(path: string, options?: HFileSendOptions): void;
    sendBuffer(buffer: Buffer): void;
    sendStream(stream: FS.ReadStream, options?: HFileSendOptions): void;
    send(obj: object): void;
    write(data: Buffer): void;
    writeEnd(): void;
}
