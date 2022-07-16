import { HMethod } from "./method";
import type { OObjectTypeDefinition } from "@element-ts/oxygen";
import type { HEndpointConstructorType, HEndpointHandler } from "./endpoint";
import type { HUploadManagerConstructorType } from "./upload-manager";
import type { HUploadManagerBuilder } from "./upload-manager-builder";

export interface HEndpointBuilderResult {
  constructor: HEndpointConstructorType;
  endpoint: string;
  method: HMethod;
}

export class HEndpointBuilder<T> {
  private readonly _method: HMethod;
  private readonly _endpoint: string;
  private _handler: HEndpointHandler;
  private _types?: OObjectTypeDefinition<T>;
  private _upload?: HUploadManagerConstructorType;

  public constructor(endpoint: string, method: HMethod) {
    this._endpoint = endpoint;
    this._method = method;
    this._handler = async (): Promise<void> => {};
  }

  public listener(handler: HEndpointHandler): HEndpointBuilder<T> {
    this._handler = handler;
    return this;
  }

  public types(type: OObjectTypeDefinition<T>): HEndpointBuilder<T> {
    this._types = type;
    return this;
  }

  public upload(upload: HUploadManagerBuilder): HEndpointBuilder<T> {
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

  public static get<T>(endpoint: string): HEndpointBuilder<T> {
    return new HEndpointBuilder(endpoint, HMethod.GET);
  }
  public static post<T>(endpoint: string): HEndpointBuilder<T> {
    return new HEndpointBuilder(endpoint, HMethod.POST);
  }
  public static put<T>(endpoint: string): HEndpointBuilder<T> {
    return new HEndpointBuilder(endpoint, HMethod.PUT);
  }
  public static delete<T>(endpoint: string): HEndpointBuilder<T> {
    return new HEndpointBuilder(endpoint, HMethod.DELETE);
  }
}
