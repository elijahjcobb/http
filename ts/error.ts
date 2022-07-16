import { HErrorStatusCode } from "./error-status-code";

export class HError {
  private message: string;
  private statusCode: HErrorStatusCode;
  private shouldShow: boolean;

  public constructor(statusCode: HErrorStatusCode, message: string) {
    this.message = message;
    this.statusCode = statusCode;
    this.shouldShow = false;
  }

  public msg(value: string): HError {
    this.message = value;
    return this;
  }

  public code(value: HErrorStatusCode): HError {
    this.statusCode = value;
    return this;
  }

  public show(): HError {
    this.shouldShow = true;
    return this;
  }
  public hide(): HError {
    this.shouldShow = false;
    return this;
  }

  public getStatusCode(): HErrorStatusCode {
    if (this.shouldShow) return this.statusCode;
    return HErrorStatusCode.InternalServerError;
  }
  public getStatusMessage(): string {
    if (this.shouldShow) return this.message;
    return "Internal server error.";
  }

  public getInternalStatusMessage(): string {
    return this.message;
  }

  public static init(): HError {
    return new HError(
      HErrorStatusCode.InternalServerError,
      "Internal server error."
    );
  }
}
