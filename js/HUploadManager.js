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
const HError_1 = require("./HError");
const FS = require("fs");
const Crypto = require("crypto");
var HUploadManagerLocationType;
(function (HUploadManagerLocationType) {
    HUploadManagerLocationType[HUploadManagerLocationType["Payload"] = 0] = "Payload";
    HUploadManagerLocationType[HUploadManagerLocationType["Stream"] = 1] = "Stream";
})(HUploadManagerLocationType = exports.HUploadManagerLocationType || (exports.HUploadManagerLocationType = {}));
class HUploadManager {
    constructor(obj) {
        this.allowedExtensions = obj.extensions;
        this.sizeLimit = obj.sizeLimit;
        this.location = obj.location;
    }
    throwFileTooBigError() {
        throw HError_1.HError.init().code(413).msg(`File too large. Limited to ${this.sizeLimit} bytes.`).show();
    }
    throwFileIncorrectType() {
        if (this.allowedExtensions !== undefined) {
            throw HError_1.HError.init()
                .code(415)
                .msg(`File incorrect format. Set correct 'content-type'. Valid types are ${this.allowedExtensions.join(", ")}.`)
                .show();
        }
    }
    getNewFilePath() {
        let name = Crypto.randomBytes(8).toString("hex");
        while (FS.existsSync(`/tmp/${name}`))
            name = Crypto.randomBytes(8).toString("hex");
        return `/tmp/${name}`;
    }
    getAllowedExtensions() { return this.allowedExtensions; }
    getSizeLimit() { return this.sizeLimit; }
    getLocation() { return this.location; }
    handleRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(((resolve, reject) => {
                const request = req.getRequest();
                if (this.allowedExtensions !== undefined) {
                    const mime = req.getHeaders()["content-type"];
                    if (mime === undefined || this.allowedExtensions.indexOf(mime) === -1)
                        this.throwFileIncorrectType();
                }
                // if (this.sizeLimit !== undefined) {
                //
                // 	const contentLength: string | undefined = req.getHeaders()["content-length"];
                // 	if (contentLength !== undefined) {
                //
                // 		const lengthNum: number = parseInt(contentLength);
                // 		if (!isNaN(lengthNum) && lengthNum > this.sizeLimit) this.throwFileTooBigError();
                //
                // 	} else this.throwFileTooBigError();
                //
                // }
                if (this.location === HUploadManagerLocationType.Payload) {
                    let payload = Buffer.alloc(0, 0);
                    request.on("data", (chunk) => {
                        payload = Buffer.concat([payload, chunk]);
                        if (this.sizeLimit !== undefined && payload.length > this.sizeLimit)
                            this.throwFileTooBigError();
                    });
                    request.on("end", () => {
                        req.setPayload(payload);
                        resolve();
                    });
                }
                else if (this.location === HUploadManagerLocationType.Stream) {
                    const filePath = this.getNewFilePath();
                    const writeStream = FS.createWriteStream(filePath);
                    let length = 0;
                    request.on("data", (chunk) => {
                        length += chunk.length;
                        writeStream.write(chunk);
                        if (this.sizeLimit !== undefined && length > this.sizeLimit)
                            this.throwFileTooBigError();
                    });
                    request.on("end", () => {
                        req.setPayloadStreamPath(filePath);
                        writeStream.end();
                        resolve();
                    });
                }
            }));
        });
    }
}
exports.HUploadManager = HUploadManager;
//# sourceMappingURL=HUploadManager.js.map