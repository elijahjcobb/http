import { HMethod } from "./HMethod";
import { HEndpointConstructorType, HEndpointHandler } from "./HEndpoint";
import { OObjectTypeDefinition } from "@element-ts/oxygen";
import { HUploadManagerConstructorType } from "./HUploadManager";
import { HUploadManagerBuilder } from "./HUploadManagerBuilder";

export interface HEndpointBuilderResult {
  constructor: HEndpointConstructorType;
  endpoint: string;
  method: HMethod;
}

export class HEndpointBuilder {
  private readonly _method: HMethod;
  private readonly _endpoint: string;
  private _handler: HEndpointHandler;
  private _types?: OObjectTypeDefinition<any>;
  private _upload?: HUploadManagerConstructorType;

  public constructor(endpoint: string, method: HMethod) {
    this._endpoint = endpoint;
    this._method = method;
    this._handler = async (): Promise<void> => {};
  }

  public listener(handler: HEndpointHandler): HEndpointBuilder {
    this._handler = handler;
    return this;
  }

  public types(type: OObjectTypeDefinition<any>): HEndpointBuilder {
    this._types = type;
    return this;
  }

  public upload(upload: HUploadManagerBuilder): HEndpointBuilder {
    this._upload = upload.build();
    return this;
  }

  public build(): HEndpointBuilderResult {
    return {
      constructor: {
        handler: this._handler,
        types: this._types,
        upload: this._upload,
      },
      method: this._method,
      endpoint: this._endpoint,
    };
  }

  public static get(endpoint: string): HEndpointBuilder {
    return new HEndpointBuilder(endpoint, HMethod.GET);
  }
  public static post(endpoint: string): HEndpointBuilder {
    return new HEndpointBuilder(endpoint, HMethod.POST);
  }
  public static put(endpoint: string): HEndpointBuilder {
    return new HEndpointBuilder(endpoint, HMethod.PUT);
  }
  public static delete(endpoint: string): HEndpointBuilder {
    return new HEndpointBuilder(endpoint, HMethod.DELETE);
  }
}
