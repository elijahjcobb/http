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

import { Dictionary } from "@ejc-tsds/dictionary";
import { Stack } from "@ejc-tsds/stack";
import { HEndpoint, HEndpointConstructorType } from "./HEndpoint";
import { HRequest } from "./HRequest";
import { HResponse } from "./HResponse";
import { HMethod, HMethodHelper } from "./HMethod";

export class HEndpointGroup {

	private endpoints: Dictionary<string, HEndpointGroup | HEndpoint>;
	private path: string;
	private postProcessHandler: ((req: HRequest, res: HResponse) => Promise<void>) | undefined;
	private static WILDCARD_KEY_ENDPOINT: string = "*e*";
	private static WILDCARD_KEY_GROUP: string = "*g*";

	public constructor(path: string = "") {

		this.path = path;
		this.endpoints = new Dictionary<string, HEndpointGroup | HEndpoint>();

	}

	private findHandlerForEndpoint(endpoints: Stack<string>, method: HMethod): HEndpoint | undefined {

		const current: string | undefined = endpoints.pop();
		if (current == undefined) return undefined;

		let entryForKey: HEndpointGroup | HEndpoint | undefined = this.endpoints.get(current);
		if (entryForKey === undefined && endpoints.peek() !== undefined) entryForKey = this.endpoints.get(HEndpointGroup.WILDCARD_KEY_GROUP);
		if (entryForKey === undefined && endpoints.peek() == undefined) entryForKey = this.endpoints.get(HEndpointGroup.WILDCARD_KEY_ENDPOINT);

		if (entryForKey === undefined) return;
		if (entryForKey instanceof HEndpoint && endpoints.peek() == undefined && entryForKey.getMethod() === method) return entryForKey;
		else if (entryForKey instanceof HEndpointGroup) return entryForKey.findHandlerForEndpoint(endpoints, method);
		else return;

	}

	public setPostProcessHandler(handler: (req: HRequest, res: HResponse) => Promise<void>): void {

		this.postProcessHandler = handler;

	}

	public getPostProcessHandler(): ((req: HRequest, res: HResponse) => Promise<void>) | undefined {

		return this.postProcessHandler;

	}

	public listen(endpoint: string, listener: HEndpointGroup | HEndpointConstructorType): void {

		if (endpoint.charAt(0) === "/") endpoint = endpoint.substring(1);

		if (listener instanceof HEndpointGroup) {

			listener.path = endpoint;
			this.endpoints.set(endpoint, listener);

		} else {

			this.endpoints.set(endpoint, new HEndpoint(endpoint, listener));

		}

	}

	public dynamicListen(listener: HEndpointGroup | HEndpointConstructorType): void {

		const endpoint: string = listener instanceof HEndpointGroup
			? HEndpointGroup.WILDCARD_KEY_GROUP
			: HEndpointGroup.WILDCARD_KEY_ENDPOINT;

		this.listen(endpoint, listener);

	}

	public getHandler(url: string, method: HMethod): HEndpoint | undefined {

		if (url.charAt(0) === "/") url = url.substring(1);
		return this.findHandlerForEndpoint(new Stack<string>(url.split("/")), method);

	}

}