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

import {HEndpointGroup, HHTTPServer, HRequest, HResponse, HUploadManagerLocation} from "./index";
import {OStandardType} from "@element-ts/oxygen";
import {HEndpointBuilder} from "./HEndpointBuilder";
import {HUploadManagerBuilder} from "./HUploadManagerBuilder";

const endpointGroup: HEndpointGroup = new HEndpointGroup();

endpointGroup.get("/hi", async(request: HRequest, response: HResponse) => {
	response.sendString("hi");
});

endpointGroup.post("/signin", {
	handler: async (req: HRequest, res: HResponse): Promise<void> => {
		const body: {name: string} = req.getBody();
		res.sendString(body.name);
	},
	types: {
		name: OStandardType.string
	}
});

endpointGroup.add(HEndpointBuilder
	.post("hello")
	.listener(async(req: HRequest, res: HResponse): Promise<void> => {

	})
	.types({
		hi: OStandardType.string
	})
	.upload(HUploadManagerBuilder
		.payload()
		.allow("jpeg")
		.allow("jpg")
		.limit(3000)
	)
);

const server: HHTTPServer = new HHTTPServer(endpointGroup, {debug: true});
server.start(3000);