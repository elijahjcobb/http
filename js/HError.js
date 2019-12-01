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
class HError {
    constructor(statusCode, message) {
        this.message = message;
        this.statusCode = statusCode;
        this.shouldShow = false;
    }
    msg(value) {
        this.message = value;
        return this;
    }
    code(value) {
        this.statusCode = value;
        return this;
    }
    show() { this.shouldShow = true; return this; }
    hide() { this.shouldShow = false; return this; }
    getStatusCode() {
        if (this.shouldShow)
            return this.statusCode;
        else
            return 500;
    }
    getStatusMessage() {
        if (this.shouldShow)
            return this.message;
        else
            return "Internal server error.";
    }
    static init() { return new HError(500, "Internal server error."); }
}
exports.HError = HError;
//# sourceMappingURL=HError.js.map