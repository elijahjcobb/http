/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */
import {HRequest} from "./HRequest";


export abstract class HLogger {

	private static isEnabled: boolean = false;

	public static logIncomingRequest(req: HRequest): void {

		console.log(`New request:`);
		try {
			console.log(JSON.stringify({
				headers: req.getHeaders(),
				url: req.getUrl(),
				endpoint: req.getEndpoint(),
				method: req.getMethod(),
				payload: req.getPayload()
			}));
		} catch (e) {}

	}

	public static log(msg: string): void {

		if (this.isEnabled) console.log(msg);

	}

	public static err(msg: string): void {

		if (this.isEnabled) console.error(msg);

	}

	public static setOn(enabled: boolean | undefined): void {

		if (enabled === true) this.isEnabled = enabled;

	}

}