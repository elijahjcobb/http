import { HEndpoint } from "./endpoint";
import { HMethod } from "./method";
import type { HEndpointConstructorType, HEndpointHandler } from "./endpoint";
import type { HRequest } from "./request";
import type { HResponse } from "./response";
import type {
  HEndpointBuilder,
  HEndpointBuilderResult,
} from "./endpoint-builder";

export class HEndpointGroup {
  private endpoints: Map<HMethod, Map<string, HEndpointGroup | HEndpoint>>;
  private path: string;
  private postProcessHandler:
    | ((req: HRequest, res: HResponse) => Promise<void>)
    | undefined;
  private static WILDCARD_KEY_ENDPOINT = "*e*";
  private static WILDCARD_KEY_GROUP = "*g*";

  public constructor(path = "") {
    this.path = path;

    this.endpoints = new Map<
      HMethod,
      Map<string, HEndpointGroup | HEndpoint>
    >();
  }

  private findHandlerForEndpoint(
    endpoints: string[],
    method: HMethod
  ): HEndpoint | undefined {
    const current: string = endpoints.pop() || "";

    let entryForKey: HEndpointGroup | HEndpoint | undefined = this.endpoints
      .get(method)
      ?.get(current);
    if (entryForKey === undefined && endpoints[endpoints.length - 1])
      entryForKey = this.endpoints
        .get(method)
        ?.get(HEndpointGroup.WILDCARD_KEY_GROUP);
    if (
      entryForKey === undefined &&
      endpoints[endpoints.length - 1] === undefined
    )
      entryForKey = this.endpoints
        .get(method)
        ?.get(HEndpointGroup.WILDCARD_KEY_ENDPOINT);

    if (entryForKey === undefined) return;
    if (
      entryForKey instanceof HEndpoint &&
      endpoints[endpoints.length - 1] === undefined &&
      entryForKey.getMethod() === method
    )
      return entryForKey;
    else if (entryForKey instanceof HEndpointGroup)
      return entryForKey.findHandlerForEndpoint(endpoints, method);
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
    let e = endpoint;
    if (typeof listener === "function")
      return this.listen(e, method, { handler: listener });

    if (e.startsWith("/")) e = e.substring(1);

    let endpointsForMethod:
      | Map<string, HEndpointGroup | HEndpoint>
      | undefined = this.endpoints.get(method);
    if (endpointsForMethod === undefined) {
      endpointsForMethod = new Map<string, HEndpointGroup | HEndpoint>();
      this.endpoints.set(method, endpointsForMethod);
    }

    if (listener instanceof HEndpointGroup) {
      listener.path = e;
      endpointsForMethod.set(e, listener);
    } else {
      endpointsForMethod.set(e, new HEndpoint(e, method, listener));
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
    let u = url;
    if (u.startsWith("/")) u = url.substring(1);
    if (u.endsWith("/")) u = url.substring(0, u.length - 1);
    return this.findHandlerForEndpoint(u.split("/"), method);
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

  public add(endpointBuilder: HEndpointBuilder<any>): void {
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
