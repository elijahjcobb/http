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

import {Dictionary} from "@ejc-tsds/dictionary";
import {Stack} from "@ejc-tsds/stack";
import {HEndpoint, HEndpointConstructorType, HEndpointHandler} from "./HEndpoint";
import {HRequest} from "./HRequest";
import {HResponse} from "./HResponse";
import {HMethod} from "./HMethod";

export class HEndpointGroup {

	private endpoints: Dictionary<HMethod, Dictionary<string, HEndpointGroup | HEndpoint>>;
	private path: string;
	private postProcessHandler: ((req: HRequest, res: HResponse) => Promise<void>) | undefined;
	private static WILDCARD_KEY_ENDPOINT: string = "*e*";
	private static WILDCARD_KEY_GROUP: string = "*g*";

	public constructor(path: string = "") {

		this.path = path;

		this.endpoints = new Dictionary<HMethod, Dictionary<string, HEndpointGroup | HEndpoint>>();

	}

	private findHandlerForEndpoint(endpoints: Stack<string>, method: HMethod): HEndpoint | undefined {

		const current: string | undefined = endpoints.pop();
		if (current == undefined) return undefined;

		let entryForKey: HEndpointGroup | HEndpoint | undefined = this.endpoints.get(method)?.get(current);
		if (entryForKey === undefined && endpoints.peek() !== undefined) entryForKey = this.endpoints.get(method)?.get(HEndpointGroup.WILDCARD_KEY_GROUP);
		if (entryForKey === undefined && endpoints.peek() == undefined) entryForKey = this.endpoints.get(method)?.get(HEndpointGroup.WILDCARD_KEY_ENDPOINT);

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

	public listen(endpoint: string, method: HMethod, listener: HEndpointGroup | HEndpointConstructorType | HEndpointHandler): void {

		if (typeof listener === "function") return this.listen(endpoint, method, { handler: listener});

		if (endpoint.charAt(0) === "/") endpoint = endpoint.substring(1);

		let endpointsForMethod: Dictionary<string, HEndpointGroup | HEndpoint> | undefined = this.endpoints.get(method);
		if (endpointsForMethod === undefined) {
			endpointsForMethod = new Dictionary<string, HEndpointGroup | HEndpoint>();
			this.endpoints.set(method, endpointsForMethod);
		}

		if (listener instanceof HEndpointGroup) {

			listener.path = endpoint;
			endpointsForMethod.set(endpoint, listener);

		} else {

			endpointsForMethod.set(endpoint, new HEndpoint(endpoint, method, listener));

		}

	}

	public dynamicListen(method: HMethod, listener: HEndpointConstructorType | HEndpointHandler): void {

		if (typeof listener === "function") return this.dynamicListen(method, { handler: listener});

		const endpoint: string = listener instanceof HEndpointGroup
			? HEndpointGroup.WILDCARD_KEY_GROUP
			: HEndpointGroup.WILDCARD_KEY_ENDPOINT;

		this.listen(endpoint, method, listener);

	}

	public getHandler(url: string, method: HMethod): HEndpoint | undefined {

		if (url.charAt(0) === "/") url = url.substring(1);
		if (url.charAt(url.length - 1) === "/") url = url.substring(0, url.length - 1);
		return this.findHandlerForEndpoint(new Stack<string>(url.split("/")), method);

	}

	public getDynamic(listener: HEndpointConstructorType | HEndpointHandler): void {

		if (typeof listener === "function") return this.dynamicListen(HMethod.GET, { handler: listener});
		this.dynamicListen(HMethod.GET, listener);

	}

	public putDynamic(listener: HEndpointConstructorType | HEndpointHandler): void {

		if (typeof listener === "function") return this.dynamicListen(HMethod.PUT, { handler: listener});
		this.dynamicListen(HMethod.PUT, listener);

	}

	public postDynamic(listener: HEndpointConstructorType | HEndpointHandler): void {

		if (typeof listener === "function") return this.dynamicListen(HMethod.POST, { handler: listener});
		this.dynamicListen(HMethod.POST, listener);

	}

	public deleteDynamic(listener: HEndpointConstructorType | HEndpointHandler): void {

		if (typeof listener === "function") return this.dynamicListen(HMethod.DELETE, { handler: listener});
		this.dynamicListen(HMethod.DELETE, listener);

	}

	public get(endpoint: string, listener: HEndpointConstructorType | HEndpointHandler): void {

		this.listen(endpoint, HMethod.GET, listener);

	}

	public post(endpoint: string, listener: HEndpointConstructorType | HEndpointHandler): void {

		this.listen(endpoint, HMethod.POST, listener);

	}

	public put(endpoint: string, listener: HEndpointConstructorType | HEndpointHandler): void {

		this.listen(endpoint, HMethod.PUT, listener);

	}

	public delete(endpoint: string, listener: HEndpointConstructorType | HEndpointHandler): void {

		this.listen(endpoint, HMethod.DELETE, listener);

	}

	public attach(endpoint: string, endpointGroup: HEndpointGroup): void {

		this.listen(endpoint, HMethod.GET, endpointGroup);
		this.listen(endpoint, HMethod.POST, endpointGroup);
		this.listen(endpoint, HMethod.PUT, endpointGroup);
		this.listen(endpoint, HMethod.DELETE, endpointGroup);

	}

}