import * as FS from "fs";
import { HError } from "./error";
import { HFileSendTypeHelper } from "./file-send-type-helper";
import { HErrorStatusCode } from "./error-status-code";
import type { HRequest } from "./request";
import type { HFileSendOptions } from "./file-send-options";
import type { HObject } from "./object";
import type * as HTTP from "http";

export class HResponse {
  private readonly headers: Map<string, string | number>;
  private readonly res: HTTP.ServerResponse;
  private statusCode: number;
  private startWrite: boolean;

  public constructor(req: HRequest, res: HTTP.ServerResponse) {
    this.headers = new Map<string, string | number>();
    this.statusCode = 200;
    this.res = res;
    this.startWrite = false;
  }

  private setHeaders(options?: HFileSendOptions): void {
    this.setHeader("X-Powered-By", "elijahjcobb/http");

    if (options) {
      if (options.mime)
        this.setHeader(
          "Content-Type",
          `${options.mime.type}/${options.mime.subtype}`
        );
      if (options.length) this.setHeader("Content-Length", options.length);

      let msg: string = HFileSendTypeHelper.typeToString(options.type);
      if (options.name) msg += `; filename="${options.name}"`;

      this.setHeader("Content-Disposition", msg);
    }

    const headers: HTTP.OutgoingHttpHeaders = Object.fromEntries(
      this.headers
    ) as HTTP.OutgoingHttpHeaders;
    this.res.writeHead(this.statusCode, headers);
  }

  private setLengthHeader(value: number): void {
    this.setHeader("Content-Length", value);
  }

  private setTypeHeader(value: string): void {
    this.setHeader("Content-Type", value);
  }

  public err(code?: HErrorStatusCode, msg?: string, show = true): void {
    this.error({ code, msg, show });
  }

  public error(obj: {
    code?: HErrorStatusCode;
    msg?: string;
    show?: boolean;
  }): void {
    let err: HError = HError.init();

    if (obj.code !== undefined) err = err.code(obj.code);
    if (obj.msg !== undefined) err = err.msg(obj.msg);
    obj.show ? err.show() : err.hide();

    this.sendError(err);
  }

  public sendError(err: HError): void {
    this.setStatusCode(err.getStatusCode());
    this.send({
      error: err.getStatusMessage(),
      code: {
        value: err.getStatusCode(),
        readable: HErrorStatusCode[err.getStatusCode()],
      },
    });
  }

  public setStatusCode(value: number): void {
    this.statusCode = value;
  }

  public setHeader(key: string, value: string | number): void {
    this.headers.set(key, value);
  }

  public redirect(url: string): void {
    this.headers.set("Location", url);
    this.setStatusCode(302);

    this.write();
    this.writeEnd();
  }

  public sendFile(path: string, options?: HFileSendOptions): void {
    let opt = options;
    if (!FS.existsSync(path))
      throw HError.init().msg("The path provided does not resolve to a file.");

    if (opt === undefined) opt = {};
    if (opt.length === undefined) opt.length = FS.statSync(path).size;

    try {
      const readableStream: FS.ReadStream = FS.createReadStream(path);
      this.sendStream(readableStream, opt);
    } catch (e) {
      throw HError.init().msg("Unable to pipe readable stream to response.");
    }
  }

  public sendBuffer(buffer: Buffer): void {
    this.setLengthHeader(buffer.length + 1);
    this.write(buffer);
    this.writeEnd();
  }

  public sendStream(stream: FS.ReadStream, options?: HFileSendOptions): void {
    this.setHeaders(options);
    stream.pipe(this.res);
  }

  public sendHObject(obj: HObject): void {
    this.send(obj.bond());
  }

  public send(obj: object): void {
    try {
      const objStringValue: string = JSON.stringify(obj);
      const objBufferValue: Buffer = Buffer.from(objStringValue);
      this.setTypeHeader("application/json; charset=utf-8");
      this.sendBuffer(objBufferValue);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      throw HError.init().msg("Unable to parse json obj into buffer.");
    }
  }

  public sendString(value: string): void {
    this.sendBuffer(Buffer.from(value, "utf8"));
  }

  public write(data?: Buffer): void {
    if (!this.startWrite) this.setHeaders();
    this.startWrite = true;

    if (data) this.res.write(data);
  }

  public writeEnd(): void {
    if (!this.startWrite)
      throw HError.init().msg(
        "You must call write() before calling writeEnd()."
      );

    this.res.end("\n");
  }
}
