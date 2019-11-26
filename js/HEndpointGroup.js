"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const dictionary_1 = require("@ejc-tsds/dictionary");
const stack_1 = require("@ejc-tsds/stack");
const HEndpoint_1 = require("./HEndpoint");
class HEndpointGroup {
    constructor(path = "") {
        this.path = path;
        this.endpoints = new dictionary_1.Dictionary();
    }
    findHandlerForEndpoint(endpoints) {
        const current = endpoints.pop();
        if (current == undefined)
            return undefined;
        let entryForKey = this.endpoints.get(current);
        if (entryForKey === undefined && endpoints.peek() !== undefined)
            entryForKey = this.endpoints.get(HEndpointGroup.WILDCARD_KEY_GROUP);
        if (entryForKey === undefined && endpoints.peek() == undefined)
            entryForKey = this.endpoints.get(HEndpointGroup.WILDCARD_KEY_ENDPOINT);
        if (entryForKey === undefined)
            return;
        if (entryForKey instanceof HEndpoint_1.HEndpoint && endpoints.peek() == undefined)
            return entryForKey;
        else if (entryForKey instanceof HEndpointGroup)
            return entryForKey.findHandlerForEndpoint(endpoints);
        else
            return;
    }
    setPostProcessHandler(handler) {
        this.postProcessHandler = handler;
    }
    getPostProcessHandler() {
        return this.postProcessHandler;
    }
    listen(endpoint, listener) {
        if (endpoint.charAt(0) === "/")
            endpoint = endpoint.substring(1);
        if (listener instanceof HEndpointGroup) {
            listener.path = endpoint;
            this.endpoints.set(endpoint, listener);
        }
        else {
            this.endpoints.set(endpoint, new HEndpoint_1.HEndpoint(endpoint, listener));
        }
    }
    dynamicListen(listener) {
        const endpoint = listener instanceof HEndpointGroup
            ? HEndpointGroup.WILDCARD_KEY_GROUP
            : HEndpointGroup.WILDCARD_KEY_ENDPOINT;
        this.listen(endpoint, listener);
    }
    getHandler(url) {
        if (url.charAt(0) === "/")
            url = url.substring(1);
        return this.findHandlerForEndpoint(new stack_1.Stack(url.split("/")));
    }
}
HEndpointGroup.WILDCARD_KEY_ENDPOINT = "*e*";
HEndpointGroup.WILDCARD_KEY_GROUP = "*g*";
exports.HEndpointGroup = HEndpointGroup;
//# sourceMappingURL=HEndpointGroup.js.map