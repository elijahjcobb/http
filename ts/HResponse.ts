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

import * as FS from "fs";
import {Dictionary} from "@ejc-tsds/dictionary";
import { HRequest } from "./HRequest";
import * as HTTP from "http";
import { PromReject, PromResolve } from "@elijahjcobb/prom-type";
import { HError } from "./HError";
import { OutgoingHttpHeaders } from "http";

export class HResponse {

	private readonly headers: Dictionary<string, string | number>;
	private readonly res: HTTP.ServerResponse;
	private statusCode: number;
	private startWrite: boolean;

	public constructor(req: HRequest, res: HTTP.ServerResponse) {

		this.headers = new Dictionary<string, string | number>();
		this.statusCode = 200;
		this.res = res;
		this.startWrite = false;

	}

	private setHeaders(): void {

		const headers: HTTP.OutgoingHttpHeaders = this.headers.toObject() as HTTP.OutgoingHttpHeaders;
		this.setHeader("X-Powered-By", "@elijahjcobb/hydrogen on NPM");
		this.res.writeHead(this.statusCode, headers);

	}

	private setLengthHeader(value: number): void {

		this.setHeader("Content-Length", value);

	}

	private setTypeHeader(value: string): void {

		this.setHeader("Content-Type", value);

	}

	public setStatusCode(value: number): void {

		this.statusCode = value;

	}

	public setHeader(key: string, value: string | number): void {

		this.headers.set(key, value);

	}

	public sendFile(path: string): void {

		if (!FS.existsSync(path)) throw HError.init().msg("The path provided does not resolve to a file.");

		try {

			const readableStream: FS.ReadStream = FS.createReadStream(path);
			this.sendStream(readableStream);

		} catch (e) {

			throw HError.init().msg("Unable to pipe readable stream to response.");

		}

	}

	public sendBuffer(buffer: Buffer): void {

		this.setLengthHeader(buffer.length);
		this.write(buffer);
		this.writeEnd();

	}

	public sendStream(stream: FS.ReadStream): void {

		this.setHeaders();
		stream.pipe(this.res);

	}

	public send(obj: object): void {

		try {

			const objStringValue: string = JSON.stringify(obj);
			const objBufferValue: Buffer = Buffer.from(objStringValue);
			this.setTypeHeader("application/json; charset=utf-8");
			this.sendBuffer(objBufferValue);

		} catch (e) {

			console.error(e);
			throw HError.init().msg("Unable to parse json obj into buffer.");

		}

	}

	public write(data: Buffer): void {

		this.startWrite = true;
		this.setHeaders();

		this.res.write(data);

	}

	public writeEnd(): void {

		if (!this.startWrite) throw HError.init().msg("You must call write() before calling writeEnd().");

		this.res.end("\n");

	}

}