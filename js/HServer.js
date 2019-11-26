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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const HTTP = require("http");
const HRequest_1 = require("./HRequest");
const HEndpointGroup_1 = require("./HEndpointGroup");
const HResponse_1 = require("./HResponse");
const HError_1 = require("./HError");
const HUploadManager_1 = require("./HUploadManager");
class HServer {
    constructor() {
        this.rootEndpointGroup = new HEndpointGroup_1.HEndpointGroup();
        this.server = HTTP.createServer((req, res) => {
            (() => __awaiter(this, void 0, void 0, function* () {
                const request = new HRequest_1.HRequest(req);
                const endpoint = this.rootEndpointGroup.getHandler(request.getUrl());
                if (endpoint) {
                    let uploadManager = endpoint.getUploadManager();
                    if (uploadManager === undefined) {
                        uploadManager = new HUploadManager_1.HUploadManager({
                            sizeLimit: 5000000,
                            location: HUploadManager_1.HUploadManagerLocationType.Payload
                        });
                    }
                    yield uploadManager.handleRequest(request);
                    const handler = endpoint.getHandler();
                    const response = new HResponse_1.HResponse(request, res);
                    const types = endpoint.getRequiredType();
                    request.fetchPayload();
                    if (types !== undefined)
                        request.verifyPayloadAgainstTypeDefinition(types);
                    yield handler(request, response);
                }
                else {
                    return this.sendJSONToSocket({ error: "Path does not exist." }, 404, res);
                }
            }))().then(() => { }).catch((err) => {
                if (err instanceof HError_1.HError) {
                    console.error(`${err.getStatusCode()} - ${err.getStatusMessage()}`);
                    return this.sendJSONToSocket({ error: err.getStatusMessage() }, err.getStatusCode(), res);
                }
                else {
                    console.error(err);
                    return this.sendJSONToSocket({ error: "Internal server error." }, 500, res);
                }
            });
        });
    }
    sendJSONToSocket(json, code, res) {
        let payload;
        res.setHeader("Content-Type", "application/json");
        try {
            const payloadString = JSON.stringify(json);
            payload = Buffer.from(payloadString, "utf8");
            res.writeHead(code);
            res.write(payload);
        }
        catch (e) {
            res.writeHead(500);
            res.write(JSON.stringify("{}"));
        }
        res.end("\n");
    }
    listen(endpoint, listener) {
        this.rootEndpointGroup.listen(endpoint, listener);
    }
    dynamicListen(listener) {
        this.rootEndpointGroup.dynamicListen(listener);
    }
    start(port = 3000, startHandler) {
        this.server.listen(port, startHandler);
    }
}
exports.HServer = HServer;
//# sourceMappingURL=HServer.js.map