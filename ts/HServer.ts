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
import { HRequest } from "./HRequest";
import { HEndpoint, HEndpointConstructorType, HEndpointHandler } from "./HEndpoint";
import { HEndpointGroup } from "./HEndpointGroup";
import { HResponse } from "./HResponse";
import { HError } from "./HError";
import { HUploadManager, HUploadManagerLocationType } from "./HUploadManager";
import { ObjectTypeDefinition } from "typit";

export class HServer {

	private server: HTTP.Server;
	private rootEndpointGroup: HEndpointGroup;

	public constructor() {

		this.rootEndpointGroup = new HEndpointGroup();
		this.server = HTTP.createServer((req: HTTP.IncomingMessage, res: HTTP.ServerResponse): void => {

			(async(): Promise<void> => {

				const request: HRequest = new HRequest(req);

				const endpoint: HEndpoint | undefined = this.rootEndpointGroup.getHandler(request.getUrl(), request.getMethod());

				if (endpoint) {

					let uploadManager: HUploadManager | undefined = endpoint.getUploadManager();

					if (uploadManager === undefined) {
						uploadManager = new HUploadManager({
							sizeLimit: 5_000_000,
							location: HUploadManagerLocationType.Payload
						});
					}

					await uploadManager.handleRequest(request);

					const handler: HEndpointHandler = endpoint.getHandler();
					const response: HResponse = new HResponse(request, res);

					const types: ObjectTypeDefinition | undefined = endpoint.getRequiredType();
					request.fetchPayload();
					if (types !== undefined) request.verifyPayloadAgainstTypeDefinition(types);

					await handler(request, response);

				} else {

					return this.sendJSONToSocket({error: "Path does not exist."}, 404, res);

				}

			})().then(() => {}).catch((err: any) => {

				if (err instanceof HError) {

					console.error(`${err.getStatusCode()} - ${err.getInternalStatusMessage()}`);
					return this.sendJSONToSocket({ error: err.getStatusMessage() }, err.getStatusCode(), res);

				} else {

					console.error(err);
					return this.sendJSONToSocket({ error: "Internal server error." }, 500, res);

				}

			});

		});

	}

	private sendJSONToSocket(json: object, code: number, res: HTTP.ServerResponse): void {

		let payload: Buffer | undefined;

		res.setHeader("Content-Type", "application/json");

		try {

			const payloadString: string = JSON.stringify(json);
			payload = Buffer.from(payloadString, "utf8");
			res.writeHead(code);
			res.write(payload);

		} catch (e) {

			res.writeHead(500);
			res.write(JSON.stringify("{}"));

		}

		res.end("\n");

	}

	public listen(endpoint: string, listener: HEndpointGroup | HEndpointConstructorType): void {

		this.rootEndpointGroup.listen(endpoint, listener);

	}

	public dynamicListen(listener: HEndpointGroup | HEndpointConstructorType): void {

		this.rootEndpointGroup.dynamicListen(listener);

	}

	public start(port: number = 3000, startHandler?: () => void): void {

		this.server.listen(port, startHandler);

	}

}