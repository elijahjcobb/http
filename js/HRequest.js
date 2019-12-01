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
const HMethod_1 = require("./HMethod");
const HError_1 = require("./HError");
const typit_1 = require("typit");
class HRequest {
    constructor(req) {
        this.headers = req.headers;
        this.url = req.url || "/";
        this.method = HMethod_1.HMethodHelper.methodFromString(req.method || "");
        this.req = req;
    }
    getRequest() { return this.req; }
    getHeaders() { return this.headers; }
    getUrl() { return this.url; }
    getMethod() { return this.method; }
    getPayload() { return this.payload; }
    getPayloadStreamPath() { return this.payloadSteamPath; }
    setPayloadStreamPath(value) { this.payloadSteamPath = value; }
    getEndpoint() {
        const elements = this.getUrl().split("/");
        return elements[elements.length - 1];
    }
    fetchPayload() {
        if (this.payload === undefined)
            return;
        try {
            const payloadString = this.payload.toString("utf8");
            this.payloadObject = JSON.parse(payloadString);
        }
        catch (e) {
            throw HError_1.HError.init().code(400).msg("Unable to decode payload.").show();
        }
    }
    verifyPayloadAgainstTypeDefinition(types) {
        if (this.payloadObject === undefined)
            throw HError_1.HError.init().code(400).msg("Payload undefined.").show();
        const typeValidator = new typit_1.ObjectType(types);
        if (!typeValidator.checkConformity(this.payloadObject))
            throw HError_1.HError.init().code(400).msg("Payload is not valid type.").show();
    }
    getBody() {
        return this.payloadObject;
    }
    setPayload(payload) { this.payload = payload; }
}
exports.HRequest = HRequest;
//# sourceMappingURL=HRequest.js.map