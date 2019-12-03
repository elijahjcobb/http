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
 
export class HError {

	private message: string;
	private statusCode: number;
	private shouldShow: boolean;

	public constructor(statusCode: number, message: string) {

		this.message = message;
		this.statusCode = statusCode;
		this.shouldShow = false;

	}

	public msg(value: string): HError {

		this.message = value;

		return this;

	}

	public code(value: number): HError {

		this.statusCode = value;

		return this;

	}

	public show(): HError { this.shouldShow = true; return this; }
	public hide(): HError { this.shouldShow = false; return this; }

	public getStatusCode(): number {

		if (this.shouldShow) return this.statusCode;
		else return 500;

	}
	public getStatusMessage(): string {

		if (this.shouldShow) return this.message;
		else return "Internal server error.";

	}

	public getInternalStatusMessage(): string {

		return this.message;

	}

	public static init(): HError { return new HError(500, "Internal server error."); }

}