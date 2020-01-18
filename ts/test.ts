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

import {HEndpointGroup, HHTTPServer, HRequest, HResponse, StandardType} from "./index";

const rootEndpoint: HEndpointGroup = new HEndpointGroup();
const userEndpoint: HEndpointGroup = new HEndpointGroup();

userEndpoint.post("/sign-up", {
	handler: async(req: HRequest, res: HResponse): Promise<void> => {

		const body: {name: string, age: number} = req.getBody();
		res.send({id: "xxx", name: body.name});

	},
	types: {
		name: StandardType.STRING,
		age: StandardType.NUMBER
	}
});

rootEndpoint.get("/hello", async(req: HRequest, res: HResponse) => {
	res.sendFile("/path-to-file");
});

rootEndpoint.attach("/user", userEndpoint);

new HHTTPServer(rootEndpoint).start(3000);