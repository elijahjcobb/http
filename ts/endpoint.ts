import { HUploadManager } from "./upload-manager";
import type { HUploadManagerConstructorType } from "./upload-manager";
import type { HMethod } from "./method";
import type { HResponse } from "./response";
import type { HRequest } from "./request";
import type { OObjectTypeDefinition } from "@element-ts/oxygen";

export interface HEndpointConstructorType<T = any> {
  handler: HEndpointHandler<T>;
  types?: OObjectTypeDefinition<T>;
  upload?: HUploadManagerConstructorType;
}

export type HEndpointHandler<T = any> = (
  req: HRequest<T>,
  res: HResponse
) => Promise<void>;

export class HEndpoint<T = any> {
  private readonly endpoint: string;
  private readonly method: HMethod;
  private readonly handler: HEndpointHandler<T>;
  private readonly requiredType: OObjectTypeDefinition<T> | undefined;
  private readonly uploadManager: HUploadManager | undefined;

  public constructor(
    endpoint: string,
    method: HMethod,
    obj: HEndpointConstructorType<T>
  ) {
    this.endpoint = endpoint;
    this.method = method;
    this.handler = obj.handler;
    this.requiredType = obj.types;
    if (obj.upload) this.uploadManager = new HUploadManager(obj.upload);
  }

  public getEndpoint(): string {
    return this.endpoint;
  }
  public getMethod(): HMethod {
    return this.method;
  }
  public getHandler(): HEndpointHandler<T> {
    return this.handler;
  }
  public getRequiredType(): OObjectTypeDefinition<T> | undefined {
    return this.requiredType;
  }
  public getUploadManager(): HUploadManager | undefined {
    return this.uploadManager;
  }
}
