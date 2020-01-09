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
import { Dictionary } from "@ejc-tsds/dictionary";
import { HRequest } from "./HRequest";
import * as HTTP from "http";
import { HError } from "./HError";
import { HFileSendOptions } from "./HFileSendOptions";
import { HFileSendTypeHelper } from "./HFileSendTypeHelper";
import * as Path from "path";
import {HObject} from "./HObject";
import {HErrorStatusCode} from "./HErrorStatusCode";

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

	private setHeaders(options?: HFileSendOptions): void {

		this.setHeader("X-Powered-By", "@elijahjcobb/hydrogen on NPM");

		if (options) {

			if (options.mime) this.setHeader("Content-Type", options.mime.type + "/" + options.mime.subtype);
			if (options.length) this.setHeader("Content-Length", options.length);

			let msg: string = HFileSendTypeHelper.typeToString(options.type);
			if (options.name) msg += "; filename=\"" + options.name + "\"";

			this.setHeader("Content-Disposition", msg);


		}

		console.log(this.headers.toObject());

		const headers: HTTP.OutgoingHttpHeaders = this.headers.toObject() as HTTP.OutgoingHttpHeaders;
		this.res.writeHead(this.statusCode, headers);

	}

	private setLengthHeader(value: number): void {

		this.setHeader("Content-Length", value);

	}

	private setTypeHeader(value: string): void {

		this.setHeader("Content-Type", value);

	}

	public err(code?: HErrorStatusCode, msg?: string, show: boolean = true): void {

		this.error({code, msg, show});

	}

	public error(obj: {code?: HErrorStatusCode, msg?: string, show?: boolean}): void {

		let err: HError = HError.init();

		if (obj.code !== undefined) err = err.code(obj.code);
		if (obj.msg !== undefined) err = err.msg(obj.msg);
		obj.show ? err.show() : err.hide();

		this.sendError(err);

	}

	public sendError(err: HError): void {

		this.setStatusCode(err.getStatusCode());

		console.error(err);

		this.send({
			error: err.getStatusMessage(),
			code: {
				value: err.getStatusCode(),
				readable: HErrorStatusCode[err.getStatusCode()]
			}
		});

	}

	public setStatusCode(value: number): void {

		this.statusCode = value;

	}

	public setHeader(key: string, value: string | number): void {

		this.headers.set(key, value);

	}

	public redirect(url: string): void {

		this.headers.set("Location", url);
		this.setStatusCode(302);

		this.write();
		this.writeEnd();

	}

	public sendFile(path: string, options?: HFileSendOptions): void {

		if (!FS.existsSync(path)) throw HError.init().msg("The path provided does not resolve to a file.");

		if (options === undefined) options = {};
		if (options.length === undefined) options.length = FS.statSync(path).size;

		try {

			const readableStream: FS.ReadStream = FS.createReadStream(path);
			this.sendStream(readableStream, options);

		} catch (e) {

			throw HError.init().msg("Unable to pipe readable stream to response.");

		}

	}

	public sendBuffer(buffer: Buffer): void {

		this.setLengthHeader(buffer.length + 1);
		this.write(buffer);
		this.writeEnd();

	}

	public sendStream(stream: FS.ReadStream, options?: HFileSendOptions): void {

		this.setHeaders(options);
		stream.pipe(this.res);

	}

	public sendHObject(obj: HObject): void {

		this.send(obj.bond());

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

	public write(data?: Buffer): void {

		if (!this.startWrite) this.setHeaders();
		this.startWrite = true;

		if (data) this.res.write(data);

	}

	public writeEnd(): void {

		if (!this.startWrite) throw HError.init().msg("You must call write() before calling writeEnd().");

		this.res.end("\n");

	}

}