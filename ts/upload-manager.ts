import { HRequest } from "./request";
import { PromReject, PromResolve } from "@elijahjcobb/prom-type";
import * as HTTP from "http";
import { HError } from "./error";
import * as FS from "fs";
import * as Crypto from "crypto";

export enum HUploadManagerLocation {
  PAYLOAD,
  STREAM,
}

export type HUploadManagerConstructorType = {
  location: HUploadManagerLocation;
  extensions?: string[];
  sizeLimit?: number;
};

export class HUploadManager {
  private readonly allowedExtensions?: string[];
  private readonly sizeLimit?: number;
  private readonly location: HUploadManagerLocation;

  public constructor(obj: HUploadManagerConstructorType) {
    this.allowedExtensions = obj.extensions;
    this.sizeLimit = obj.sizeLimit;
    this.location = obj.location;
  }

  private throwFileIncorrectType(): void {
    if (this.allowedExtensions !== undefined) {
      throw HError.init()
        .code(415)
        .msg(
          `File incorrect format. Set correct 'content-type'. Valid types are ${this.allowedExtensions.join(
            ", "
          )}.`
        )
        .show();
    }
  }

  private getNewFilePath(): string {
    let name: string = Crypto.randomBytes(8).toString("hex");
    while (FS.existsSync(`/tmp/${name}`))
      name = Crypto.randomBytes(8).toString("hex");

    return `/tmp/${name}`;
  }

  public getAllowedExtensions(): string[] | undefined {
    return this.allowedExtensions;
  }
  public getSizeLimit(): number | undefined {
    return this.sizeLimit;
  }
  public getLocation(): HUploadManagerLocation {
    return this.location;
  }

  public async handleRequest(req: HRequest): Promise<void> {
    return new Promise<void>(
      (resolve: PromResolve<void>, reject: PromReject): void => {
        const request: HTTP.IncomingMessage = req.getRequest();

        if (this.allowedExtensions !== undefined) {
          const mime: string | undefined = req.getHeaders()["content-type"];

          if (mime === undefined || this.allowedExtensions.indexOf(mime) === -1)
            this.throwFileIncorrectType();
        }

        if (this.sizeLimit !== undefined) {
          const contentLength: string | undefined =
            req.getHeaders()["content-length"];

          if (contentLength !== undefined) {
            const lengthNum: number = parseInt(contentLength);
            if (!isNaN(lengthNum) && lengthNum > this.sizeLimit)
              return reject(
                HError.init()
                  .code(413)
                  .msg(`File too large. Limited to ${this.sizeLimit} bytes.`)
                  .show()
              );
          }
        }

        if (this.location === HUploadManagerLocation.PAYLOAD) {
          let payload: Buffer = Buffer.alloc(0, 0);
          request.on("data", (chunk: Buffer): void => {
            payload = Buffer.concat([payload, chunk]);

            if (this.sizeLimit !== undefined && payload.length > this.sizeLimit)
              return reject(
                HError.init()
                  .code(413)
                  .msg(`File too large. Limited to ${this.sizeLimit} bytes.`)
                  .show()
              );
          });

          request.on("end", (): void => {
            req.setPayload(payload);

            resolve();
          });
        } else if (this.location === HUploadManagerLocation.STREAM) {
          const filePath: string = this.getNewFilePath();
          const writeStream: FS.WriteStream = FS.createWriteStream(filePath);

          let length: number = 0;

          request.on("data", (chunk: Buffer): void => {
            length += chunk.length;
            writeStream.write(chunk);

            if (this.sizeLimit !== undefined && length > this.sizeLimit) {
              return reject(
                HError.init()
                  .code(413)
                  .msg(`File too large. Limited to ${this.sizeLimit} bytes.`)
                  .show()
              );
            }
          });

          request.on("end", (): void => {
            req.setPayloadStreamPath(filePath);
            writeStream.end();
            resolve();
          });
        }
      }
    );
  }
}
