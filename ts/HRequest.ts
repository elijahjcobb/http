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

import * as HTTP from "http";
import * as FS from "fs";
import { HMethod, HMethodHelper } from "./HMethod";
import { HError } from "./HError";
import {OObjectType, OObjectTypeDefinition, OType} from "@element-ts/oxygen";

export class HRequest {

	private readonly req: HTTP.IncomingMessage;
	private readonly headers: HTTP.IncomingHttpHeaders;
	private readonly url: string;
	private readonly method: HMethod;
	private payload: Buffer | undefined;
	private payloadSteamPath: string | undefined;
	private payloadObject: object | undefined;

	public constructor(req: HTTP.IncomingMessage) {

		this.headers = req.headers;
		this.url = req.url || "/";
		this.method = HMethodHelper.methodFromString(req.method || "");
		this.req = req;

	}

	public getRequest(): HTTP.IncomingMessage { return this.req; }
	public getHeaders(): HTTP.IncomingHttpHeaders { return this.headers; }
	public getUrl(): string { return this.url; }
	public getMethod(): HMethod { return this.method; }
	public getPayload(): Buffer | undefined { return this.payload; }
	public getPayloadStreamPath(): string | undefined { return this.payloadSteamPath; }
	public setPayloadStreamPath(value: string): void { this.payloadSteamPath = value; }

	public getPayloadStream(): FS.ReadStream | undefined  {

		if (this.payloadSteamPath === undefined) return undefined;
		if (!FS.existsSync(this.payloadSteamPath)) return undefined;

		return FS.createReadStream(this.payloadSteamPath);

	}

	public getPayloadStreamData(): Buffer | undefined  {

		if (this.payloadSteamPath === undefined) return undefined;
		if (!FS.existsSync(this.payloadSteamPath)) return undefined;

		return FS.readFileSync(this.payloadSteamPath);

	}

	public getEndpoint(): string {

		const elements: string[] = this.getUrl().split("/");
		return elements[elements.length - 1];

	}

	public fetchPayload(): void {

		if (this.payload === undefined) return;
		if (this.payload.length === 0) return;

		try {

			const payloadString: string = this.payload.toString("utf8");
			this.payloadObject = JSON.parse(payloadString);

		} catch (e) {

			throw HError.init().code(400).msg("Unable to decode payload.").show();

		}

	}

	public verifyPayloadAgainstTypeDefinition(types: OObjectTypeDefinition): void {

		if (this.payloadObject === undefined) throw HError.init().code(400).msg("Payload undefined.").show();
		const typeValidator: OType = OObjectType.follow(types);
		if (!typeValidator.conforms(this.payloadObject)) throw HError.init().code(400).msg("Payload is not valid type.").show();

	}

	public getBody<T = object>(): T {

		return this.payloadObject as unknown as T;

	}

	public setPayload(payload: Buffer): void { this.payload = payload; }

}