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
import {HRequest} from "./HRequest";
import {HEndpoint, HEndpointHandler} from "./HEndpoint";
import {HEndpointGroup} from "./HEndpointGroup";
import {HResponse} from "./HResponse";
import {HError} from "./HError";
import {HUploadManager, HUploadManagerLocationType} from "./HUploadManager";
import {ObjectTypeDefinition} from "typit";
import {HErrorStatusCode} from "./HErrorStatusCode";

export abstract class HServer {

	private rootEndpointGroup: HEndpointGroup;

	protected constructor(endpointGroup: HEndpointGroup) {

		this.rootHandler = this.rootHandler.bind(this);
		this.rootEndpointGroup = endpointGroup;

	}

	protected rootHandler(req: HTTP.IncomingMessage, res: HTTP.ServerResponse): void {

		const request: HRequest = new HRequest(req);
		const response: HResponse = new HResponse(request, res);

		(async(): Promise<void> => {

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

				const types: ObjectTypeDefinition | undefined = endpoint.getRequiredType();
				request.fetchPayload();
				if (types !== undefined) request.verifyPayloadAgainstTypeDefinition(types);

				await handler(request, response);

			} else return response.error({code: HErrorStatusCode.NotFound, msg: "Path does not exist.", show: true });

		})().then(() => {}).catch((err: any) => {

			if (err instanceof HError) {

				console.error(`${err.getStatusCode()} - ${err.getInternalStatusMessage()}`);
				return response.sendError(err);

			} else {

				console.error(err);
				return response.error({code: HErrorStatusCode.InternalServerError, msg: "Internal Server Error."});

			}

		});

	}

}