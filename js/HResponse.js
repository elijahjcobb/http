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
const FS = require("fs");
const dictionary_1 = require("@ejc-tsds/dictionary");
const HError_1 = require("./HError");
const HFileSendTypeHelper_1 = require("./HFileSendTypeHelper");
class HResponse {
    constructor(req, res) {
        this.headers = new dictionary_1.Dictionary();
        this.statusCode = 200;
        this.res = res;
        this.startWrite = false;
    }
    setHeaders(options) {
        this.setHeader("X-Powered-By", "@elijahjcobb/hydrogen on NPM");
        if (options) {
            if (options.mime)
                this.setHeader("Content-Type", options.mime.type + "/" + options.mime.subtype);
            if (options.length)
                this.setHeader("Content-Length", options.length);
            let msg = HFileSendTypeHelper_1.HFileSendTypeHelper.typeToString(options.type);
            if (options.name)
                msg += "; filename=\"" + options.name + "\"";
            this.setHeader("Content-Disposition", msg);
        }
        console.log(this.headers.toObject());
        const headers = this.headers.toObject();
        this.res.writeHead(this.statusCode, headers);
    }
    setLengthHeader(value) {
        this.setHeader("Content-Length", value);
    }
    setTypeHeader(value) {
        this.setHeader("Content-Type", value);
    }
    setStatusCode(value) {
        this.statusCode = value;
    }
    setHeader(key, value) {
        this.headers.set(key, value);
    }
    sendFile(path, options) {
        if (!FS.existsSync(path))
            throw HError_1.HError.init().msg("The path provided does not resolve to a file.");
        if (options === undefined)
            options = {};
        if (options.length === undefined)
            options.length = FS.statSync(path).size;
        try {
            const readableStream = FS.createReadStream(path);
            this.sendStream(readableStream, options);
        }
        catch (e) {
            throw HError_1.HError.init().msg("Unable to pipe readable stream to response.");
        }
    }
    sendBuffer(buffer) {
        this.setLengthHeader(buffer.length + 1);
        this.write(buffer);
        this.writeEnd();
    }
    sendStream(stream, options) {
        this.setHeaders(options);
        stream.pipe(this.res);
    }
    send(obj) {
        try {
            const objStringValue = JSON.stringify(obj);
            const objBufferValue = Buffer.from(objStringValue);
            this.setTypeHeader("application/json; charset=utf-8");
            this.sendBuffer(objBufferValue);
        }
        catch (e) {
            console.error(e);
            throw HError_1.HError.init().msg("Unable to parse json obj into buffer.");
        }
    }
    write(data) {
        if (!this.startWrite)
            this.setHeaders();
        this.startWrite = true;
        this.res.write(data);
    }
    writeEnd() {
        if (!this.startWrite)
            throw HError_1.HError.init().msg("You must call write() before calling writeEnd().");
        this.res.end("\n");
    }
}
exports.HResponse = HResponse;
//# sourceMappingURL=HResponse.js.map