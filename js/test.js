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
const index_1 = require("./index");
const server = new index_1.HServer();
server.listen("/hello", {
    method: index_1.HMethod.POST,
    handler: ((req, res) => __awaiter(this, void 0, void 0, function* () {
        const body = req.getBody();
        if (body.foo > 18)
            res.send({ msg: true });
        else
            res.send({ m: 0 });
    })),
    types: {
        foo: index_1.StandardType.NUMBER
    },
    upload: {
        location: index_1.HUploadManagerLocationType.Payload,
        sizeLimit: 16
    }
});
server.listen("/file", {
    method: index_1.HMethod.GET,
    handler: ((req, res) => __awaiter(this, void 0, void 0, function* () {
        res.sendFile("/Users/elijahcobb/Downloads/Assignment8_Graph_Algorithm.pdf", {
            name: "algo.pdf",
            type: index_1.HFileSendType.INLINE,
            mime: {
                type: "application",
                subtype: "pdf"
            }
        });
    }))
});
server.start(3000);
//# sourceMappingURL=test.js.map