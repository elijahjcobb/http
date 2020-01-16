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

import {HEndpointGroup, HErrorStatusCode, HHTTPServer, HRequest, HResponse} from "./index";

const rootEndpoint: HEndpointGroup = new HEndpointGroup();

rootEndpoint.get("a", async(req: HRequest, res: HResponse) => {
	res.send(req.getHeaders());
});

rootEndpoint.get("b", async(req: HRequest, res: HResponse) => {
	res.err(HErrorStatusCode.ImATeapot, "I am a teapot!");
});

rootEndpoint.get("c", async(req: HRequest, res: HResponse) => {
	res.redirect("y/a");
});

rootEndpoint.get("d", async(req: HRequest, res: HResponse) => {
	res.write(Buffer.from("a"));
	setTimeout(() => {

		res.write(Buffer.from("b"));

		setTimeout(() => {

			res.write(Buffer.from("c"));

			setTimeout(() => {

				res.write(Buffer.from("d"));

				setTimeout(() => {

					res.write(Buffer.from("e"));

					setTimeout(() => {

						res.write(Buffer.from("f"));
						res.writeEnd();


					}, 500);

				}, 500);

			}, 500);

		}, 500);

	}, 500);

});

rootEndpoint.get("e", async(req: HRequest, res: HResponse) => {
	res.sendFile("/home/elijahcobb/Pictures/profile.jpeg");
});

import * as FS from "fs";

rootEndpoint.get("f", async(req: HRequest, res: HResponse) => {

	res.sendStream(FS.createReadStream("/home/elijahcobb/Pictures/profile.jpeg"));

});

const x: HEndpointGroup = new HEndpointGroup();
const y: HEndpointGroup = new HEndpointGroup();
const z: HEndpointGroup = new HEndpointGroup();

rootEndpoint.attach("x", x);
rootEndpoint.attach("y", y);
rootEndpoint.attach("z", z);

x.post("a", async(req: HRequest, res: HResponse): Promise<void> => res.sendString("x-a"));
x.post("b", async(req: HRequest, res: HResponse): Promise<void> => res.sendString("x-b"));
x.post("c", async(req: HRequest, res: HResponse): Promise<void> => res.sendString("x-c"));

y.get("a", async(req: HRequest, res: HResponse): Promise<void> => res.sendString("y-a"));
y.get("b", async(req: HRequest, res: HResponse): Promise<void> => res.sendString("y-b"));
y.get("c", async(req: HRequest, res: HResponse): Promise<void> => res.sendString("y-c"));

z.get("a", async(req: HRequest, res: HResponse): Promise<void> => res.sendString("z-a"));
z.get("b", async(req: HRequest, res: HResponse): Promise<void> => res.sendString("z-b"));
z.get("c", async(req: HRequest, res: HResponse): Promise<void> => res.sendString("z-c"));

new HHTTPServer(rootEndpoint).start(3000, () => console.log("Server LIVE!"));