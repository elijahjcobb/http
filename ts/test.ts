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

import {
	HFileSendType,
	HObject,
	HRequest,
	HResponse,
	HUploadManagerLocationType,
	StandardType,
	HErrorStatusCode,
	HEndpointGroup,
	HHTTPServer
} from "./index";

const endpoint: HEndpointGroup = new HEndpointGroup();

class UserTest implements HObject {

	public name: string | undefined;
	public password: string | undefined;

	public bond(): object {
		return {
			name: this.name
		};
	}
}

endpoint.post("/hello", {
	handler: (async (req: HRequest, res: HResponse): Promise<void> => {

		const body: {foo: number} = req.getBody();

		const user: UserTest = new UserTest();
		user.name = "John";
		user.password = "p";

		if (body.foo > 18) res.sendHObject(user);
		else return res.error({code: HErrorStatusCode.ImATeapot, show: true});

	}),
	types: {
		foo: StandardType.NUMBER
	},
	upload: {
		location: HUploadManagerLocationType.Payload,
		sizeLimit: 16
	}
});

endpoint.get("/file", async (req: HRequest, res: HResponse): Promise<void> => {

	res.sendFile("/home/elijahcobb/Documents/hydro-test.txt", {
		name: "hydro.txt",
		type: HFileSendType.DOWNLOAD,
		mime: {
			type: "application",
			subtype: "txt"
		}
	});

});

endpoint.get("/ping", async (req: HRequest, res: HResponse): Promise<void> => {

	res.sendString("pong");

});

endpoint.get("/google", async (req: HRequest, res: HResponse): Promise<void> => {
	res.redirect("https://google.com");
});

endpoint.getDynamic(async (req: HRequest, res: HResponse): Promise<void> => {

	res.send({msg: "GET " + req.getEndpoint()});

});

endpoint.postDynamic(async (req: HRequest, res: HResponse): Promise<void> => {

	res.send({msg: "POST " + req.getEndpoint()});

});

new HHTTPServer(endpoint).start(3000);