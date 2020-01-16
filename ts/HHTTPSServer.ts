/**
 *
 * Elijah Cobb
 *
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 *
 */
import {HServer} from "./HServer";
import {HEndpointGroup} from "./HEndpointGroup";
import * as HTTPS from "https";

export class HHTTPSServer extends HServer {

	private server: HTTPS.Server;

	public constructor(endpointGroup: HEndpointGroup, key: Buffer, cert: Buffer) {

		super(endpointGroup);

		this.server = HTTPS.createServer({key, cert}, this.rootHandler);

	}

	public start(port: number = 443, listener?: () => void): void {

		this.server.listen(port, listener);

	}

}