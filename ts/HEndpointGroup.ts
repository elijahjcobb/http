import { Dictionary } from "@ejc-tsds/dictionary";
import { Stack } from "@ejc-tsds/stack";
import {
  HEndpoint,
  HEndpointConstructorType,
  HEndpointHandler,
} from "./HEndpoint";
import { HRequest } from "./HRequest";
import { HResponse } from "./HResponse";
import { HMethod } from "./HMethod";
import { HEndpointBuilder, HEndpointBuilderResult } from "./HEndpointBuilder";

export class HEndpointGroup {
  private endpoints: Dictionary<
    HMethod,
    Dictionary<string, HEndpointGroup | HEndpoint>
  >;
  private path: string;
  private postProcessHandler:
    | ((req: HRequest, res: HResponse) => Promise<void>)
    | undefined;
  private static WILDCARD_KEY_ENDPOINT: string = "*e*";
  private static WILDCARD_KEY_GROUP: string = "*g*";

  public constructor(path: string = "") {
    this.path = path;

    this.endpoints = new Dictionary<
      HMethod,
      Dictionary<string, HEndpointGroup | HEndpoint>
    >();
  }

  private findHandlerForEndpoint(
    endpoints: Stack<string>,
    method: HMethod
  ): HEndpoint | undefined {
    const current: string = endpoints.pop() || "";

    let entryForKey: HEndpointGroup | HEndpoint | undefined = this.endpoints
      .get(method)
      ?.get(current);
    if (entryForKey === undefined && endpoints.peek() !== undefined)
      entryForKey = this.endpoints
        .get(method)
        ?.get(HEndpointGroup.WILDCARD_KEY_GROUP);
    if (entryForKey === undefined && endpoints.peek() == undefined)
      entryForKey = this.endpoints
        .get(method)
        ?.get(HEndpointGroup.WILDCARD_KEY_ENDPOINT);

    if (entryForKey === undefined) return;
    if (
      entryForKey instanceof HEndpoint &&
      endpoints.peek() == undefined &&
      entryForKey.getMethod() === method
    )
      return entryForKey;
    else if (entryForKey instanceof HEndpointGroup)
      return entryForKey.findHandlerForEndpoint(endpoints, method);
    else return;
  }

  public setPostProcessHandler(
    handler: (req: HRequest, res: HResponse) => Promise<void>
  ): void {
    this.postProcessHandler = handler;
  }

  public getPostProcessHandler():
    | ((req: HRequest, res: HResponse) => Promise<void>)
    | undefined {
    return this.postProcessHandler;
  }

  public listen(
    endpoint: string,
    method: HMethod,
    listener: HEndpointGroup | HEndpointConstructorType | HEndpointHandler
  ): void {
    if (typeof listener === "function")
      return this.listen(endpoint, method, { handler: listener });

    if (endpoint.charAt(0) === "/") endpoint = endpoint.substring(1);

    let endpointsForMethod:
      | Dictionary<string, HEndpointGroup | HEndpoint>
      | undefined = this.endpoints.get(method);
    if (endpointsForMethod === undefined) {
      endpointsForMethod = new Dictionary<string, HEndpointGroup | HEndpoint>();
      this.endpoints.set(method, endpointsForMethod);
    }

    if (listener instanceof HEndpointGroup) {
      listener.path = endpoint;
      endpointsForMethod.set(endpoint, listener);
    } else {
      endpointsForMethod.set(
        endpoint,
        new HEndpoint(endpoint, method, listener)
      );
    }
  }

  public dynamicListen(
    method: HMethod,
    listener: HEndpointConstructorType | HEndpointHandler
  ): void {
    if (typeof listener === "function")
      return this.dynamicListen(method, { handler: listener });

    const endpoint: string =
      listener instanceof HEndpointGroup
        ? HEndpointGroup.WILDCARD_KEY_GROUP
        : HEndpointGroup.WILDCARD_KEY_ENDPOINT;

    this.listen(endpoint, method, listener);
  }

  public getHandler(url: string, method: HMethod): HEndpoint | undefined {
    if (url.charAt(0) === "/") url = url.substring(1);
    if (url.charAt(url.length - 1) === "/")
      url = url.substring(0, url.length - 1);
    return this.findHandlerForEndpoint(
      new Stack<string>(url.split("/")),
      method
    );
  }

  public getDynamic(
    listener: HEndpointConstructorType | HEndpointHandler
  ): void {
    if (typeof listener === "function")
      return this.dynamicListen(HMethod.GET, { handler: listener });
    this.dynamicListen(HMethod.GET, listener);
  }

  public putDynamic(
    listener: HEndpointConstructorType | HEndpointHandler
  ): void {
    if (typeof listener === "function")
      return this.dynamicListen(HMethod.PUT, { handler: listener });
    this.dynamicListen(HMethod.PUT, listener);
  }

  public postDynamic(
    listener: HEndpointConstructorType | HEndpointHandler
  ): void {
    if (typeof listener === "function")
      return this.dynamicListen(HMethod.POST, { handler: listener });
    this.dynamicListen(HMethod.POST, listener);
  }

  public deleteDynamic(
    listener: HEndpointConstructorType | HEndpointHandler
  ): void {
    if (typeof listener === "function")
      return this.dynamicListen(HMethod.DELETE, { handler: listener });
    this.dynamicListen(HMethod.DELETE, listener);
  }

  public get(
    endpoint: string,
    listener: HEndpointConstructorType | HEndpointHandler
  ): void {
    this.listen(endpoint, HMethod.GET, listener);
  }

  public post(
    endpoint: string,
    listener: HEndpointConstructorType | HEndpointHandler
  ): void {
    this.listen(endpoint, HMethod.POST, listener);
  }

  public put(
    endpoint: string,
    listener: HEndpointConstructorType | HEndpointHandler
  ): void {
    this.listen(endpoint, HMethod.PUT, listener);
  }

  public delete(
    endpoint: string,
    listener: HEndpointConstructorType | HEndpointHandler
  ): void {
    this.listen(endpoint, HMethod.DELETE, listener);
  }

  public add(endpointBuilder: HEndpointBuilder): void {
    const result: HEndpointBuilderResult = endpointBuilder.build();
    this.listen(result.endpoint, result.method, result.constructor);
  }

  public attach(endpoint: string, endpointGroup: HEndpointGroup): void {
    this.listen(endpoint, HMethod.GET, endpointGroup);
    this.listen(endpoint, HMethod.POST, endpointGroup);
    this.listen(endpoint, HMethod.PUT, endpointGroup);
    this.listen(endpoint, HMethod.DELETE, endpointGroup);
  }
}
