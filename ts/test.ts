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

import {HFileSendType, HMethod, HRequest, HResponse, HServer, HUploadManagerLocationType, StandardType} from "./index";

const server: HServer = new HServer();

server.listen("/hello", {
	method: HMethod.POST,
	handler: (async (req: HRequest, res: HResponse): Promise<void> => {

		const body: {foo: number} = req.getBody();

		if (body.foo > 18) res.send({msg: true});
		else res.send({m: 0});

	}),
	types: {
		foo: StandardType.NUMBER
	},
	upload: {
		location: HUploadManagerLocationType.Payload,
		sizeLimit: 16
	}
});

server.listen("/file", {
	method: HMethod.GET,
	handler: (async (req: HRequest, res: HResponse): Promise<void> => {

		res.sendFile("/Users/elijahcobb/Downloads/Assignment8_Graph_Algorithm.pdf", {
			name: "algo.pdf",
			type: HFileSendType.INLINE,
			mime: {
				type: "application",
				subtype: "pdf"
			}
		});

	})
});

server.listen("/goo", {
	method: HMethod.GET,
	handler: (async (req: HRequest, res: HResponse): Promise<void> => {

		res.redirect("/notgoo");

	})
});

server.listen("/notgoo", {
	method: HMethod.GET,
	handler: (async (req: HRequest, res: HResponse): Promise<void> => {

		res.send({msg: "Hello, Elijah!"});

	})
});

server.start(3000);