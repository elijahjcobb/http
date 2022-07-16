import {
  HUploadManager,
  HUploadManagerConstructorType,
} from "./HUploadManager";
import { HMethod } from "./HMethod";
import { HResponse } from "./HResponse";
import { HRequest } from "./HRequest";
import { OObjectTypeDefinition } from "@element-ts/oxygen";

export type HEndpointConstructorType = {
  handler: HEndpointHandler;
  types?: OObjectTypeDefinition<any>;
  upload?: HUploadManagerConstructorType;
};

export type HEndpointHandler = (req: HRequest, res: HResponse) => Promise<void>;

export class HEndpoint {
  private readonly endpoint: string;
  private readonly method: HMethod;
  private readonly handler: HEndpointHandler;
  private readonly requiredType: OObjectTypeDefinition<any> | undefined;
  private readonly uploadManager: HUploadManager | undefined;

  public constructor(
    endpoint: string,
    method: HMethod,
    obj: HEndpointConstructorType
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
  public getHandler(): HEndpointHandler {
    return this.handler;
  }
  public getRequiredType(): OObjectTypeDefinition<any> | undefined {
    return this.requiredType;
  }
  public getUploadManager(): HUploadManager | undefined {
    return this.uploadManager;
  }
}
