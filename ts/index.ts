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
import {PromResolve, PromReject} from "@elijahjcobb/prom-type";
import {StandardType, ObjectTypeDefinition, ObjectType} from  "typit";
import { Dictionary } from "@ejc-tsds/dictionary";

class HRequest {

	private readonly headers: HTTP.IncomingHttpHeaders;
	private readonly url: string;
	private readonly method: HMethod;
	private payload: Buffer | undefined;

	public constructor(req: HTTP.IncomingMessage, completion: () => void) {

		this.headers = req.headers;
		this.url = req.url || "/";
		this.method = HMethodHelper.methodFromString(req.method || "");

		let payload: Buffer = Buffer.alloc(0, 0);
		this.payload = payload;

		req.on("data", (chunk: Buffer) => payload = Buffer.concat([payload, chunk]));
		req.on("end", () => {

			this.payload = payload;
			completion();

		});

	}

	public getHeaders(): HTTP.IncomingHttpHeaders { return this.headers; }
	public getUrl(): string { return this.url; }
	public getMethod(): HMethod { return this.method; }
	public getPayload(): Buffer | undefined { return this.payload; }

	public static async init(req: HTTP.IncomingMessage): Promise<HRequest> {
		return new Promise(((resolve: PromResolve<HRequest>, reject: PromReject): void => {
			const request: HRequest = new HRequest(req, (): void => resolve(request));
		}));
	}



}

class HResponse {

}

const server: HTTP.Server = HTTP.createServer((req: HTTP.IncomingMessage, res: HTTP.ServerResponse): void => {

	const r: HRequest = new HRequest(req, (): void => {

		res.writeHead(200);
		res.write(r.getPayload());
		res.end("\n");

	});

});

server.listen(3000, () => {

	console.log("Server started.");

});

enum HMethod { GET, POST, PUT , DELETE, UNKNOWN }

abstract class HMethodHelper {

	public static methodFromString(method: string): HMethod {
		switch (method) {
			case "GET":
				return HMethod.GET;
			case "POST":
				return HMethod.POST;
			case "PUT":
				return HMethod.PUT;
			case "DELETE":
				return HMethod.DELETE;
			default:
				return HMethod.UNKNOWN;
		}
	}

	public static stringFromMethod(method: HMethod): string {
		switch (method) {
			case HMethod.GET:
				return "GET";
			case HMethod.POST:
				return "POST";
			case HMethod.PUT:
				return "PUT";
			case HMethod.DELETE:
				return "DELETE";
			default:
				return "UNKNOWN";
		}
	}

}

type HUploadManagerConstructorType = {
	extension?: string;
	sizeLimit?: number;
	location?: string;
};

class HUploadManager {

	private extension?: string;
	private sizeLimit?: number;
	private location?: string;

	public constructor(obj: HUploadManagerConstructorType) {

		this.extension = obj.extension;
		this.sizeLimit = obj.sizeLimit;
		this.location = obj.location;

	}

}

type HHandlerConstructorType = {
	endpoint: string;
	method: HMethod;
	handler: (req: HRequest) => Promise<string>;
	types?: ObjectTypeDefinition;
	upload?: HUploadManagerConstructorType;
};

class HHandler {

	private endpoint: string;
	private method: HMethod;
	private handler: (req: HRequest) => Promise<string>;
	private requiredType: ObjectTypeDefinition | undefined;
	private uploadManager: HUploadManager | undefined;

	public constructor(obj: HHandlerConstructorType) {

		this.endpoint = obj.endpoint;
		this.method = obj.method;
		this.handler = obj.handler;
		this.requiredType = obj.types;
		if (obj.upload) this.uploadManager = new HUploadManager(obj.upload);

	}

}

class HEndpoint {

	private endpoints: Dictionary<string, HEndpoint | HHandler>;

	public constructor() {

		this.endpoints = new Dictionary<string, HEndpoint | HHandler>();

	}

	public listen(endpoint: string, listener: HEndpoint | HHandler): void {

		this.endpoints.set(endpoint, listener);

	}

	public findListenerForEndpoint(endpoint: string): HHandler | undefined {

		//recurse down the buckets

		return undefined;
	}

}

new HHandler({
	endpoint: "/well/hello/here/we/are",
	method: HMethod.POST,
	handler: async (req: HRequest): Promise<string> => {
		return  "";
	},
	types: {
		"feefw": StandardType.STRING,
		"fewfewe": StandardType.NUMBER
	},
	upload: {
		extension: "doc",
		sizeLimit: 1024,
		location: "/tmp/1.pdf"
	}
});