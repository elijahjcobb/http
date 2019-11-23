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
class HRequest {
    constructor(req, completion) {
        this.headers = req.headers;
        this.url = req.url;
        this.method = req.method;
        let payload = Buffer.alloc(0, 0);
        this.payload = payload;
        req.on("data", (chunk) => payload = Buffer.concat([payload, chunk]));
        req.on("end", () => {
            this.payload = payload;
            completion();
        });
    }
    getHeaders() { return this.headers; }
    getUrl() { return this.url || "/"; }
    getMethod() { return this.method || "GET"; }
    getPayload() { return this.payload; }
    static init(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(((resolve, reject) => {
                const request = new HRequest(req, () => resolve(request));
            }));
        });
    }
}
class HResponse {
}
const server = HTTP.createServer((req, res) => {
    const r = new HRequest(req, () => {
        res.writeHead(200);
        res.write(r.getPayload());
        res.end("\n");
    });
});
server.listen(3000, () => {
    console.log("Server started.");
});
//# sourceMappingURL=index.js.map