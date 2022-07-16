import { Neon } from "@element-ts/neon";
import { HRequest } from "./request";
import { HResponse } from "./response";
import { HError } from "./error";
import { HUploadManager, HUploadManagerLocation } from "./upload-manager";
import { HErrorStatusCode } from "./error-status-code";
import { HMethod } from "./method";
import type { HEndpointGroup } from "./endpoint-group";
import type { HEndpoint, HEndpointHandler } from "./endpoint";
import type * as HTTP from "http";
import type { OObjectTypeDefinition } from "@element-ts/oxygen";

export interface HServerConfig {
  debug?: boolean;
}

export abstract class HServer {
  private rootEndpointGroup: HEndpointGroup;
  public static neon: Neon = new Neon();

  protected constructor(
    endpointGroup: HEndpointGroup,
    config: HServerConfig | undefined
  ) {
    this.rootHandler = this.rootHandler.bind(this);
    this.rootEndpointGroup = endpointGroup;

    if (config?.debug === true) {
      HServer.neon.enable();
      HServer.neon.setTitle("@element-ts/hydrogen");
    }
  }

  protected rootHandler(
    req: HTTP.IncomingMessage,
    res: HTTP.ServerResponse
  ): void {
    const request: HRequest<any> = new HRequest(req);
    HServer.neon.log("Created HRequest instance for new request.");
    HServer.neon.log({
      headers: request.getHeaders(),
      url: request.getUrl(),
      endpoint: request.getEndpoint(),
      method: request.getMethod(),
      payload: request.getPayload(),
    });
    const response: HResponse = new HResponse(request, res);
    HServer.neon.log("Created HResponse instance for new request.");

    (async (): Promise<void> => {
      const url: string = request.getUrl();
      const method: HMethod = request.getMethod();

      HServer.neon.log(`Looking for endpoint for ${HMethod[method]} ${url}.`);

      const endpoint: HEndpoint<any> | undefined =
        this.rootEndpointGroup.getHandler(url, method);

      if (endpoint) {
        HServer.neon.log("Found endpoint.");

        let uploadManager: HUploadManager | undefined =
          endpoint.getUploadManager();

        if (uploadManager === undefined) {
          HServer.neon.log(`Setting default upload manager options.`);
          uploadManager = new HUploadManager({
            sizeLimit: 5_000_000,
            location: HUploadManagerLocation.PAYLOAD,
          });
        } else {
          HServer.neon.log(
            `Found an HUploadManager instance for this endpoint.`
          );
        }

        HServer.neon.log(`Passing control to HUploadManager instance.`);
        await uploadManager.handleRequest(request);
        HServer.neon.log(`Received control from HUploadManager instance.`);

        HServer.neon.log(`Fetching HEndpointHandler.`);
        const handler: HEndpointHandler<any> = endpoint.getHandler();

        const types: OObjectTypeDefinition<any> | undefined =
          endpoint.getRequiredType();
        request.fetchPayload();
        if (types !== undefined) {
          HServer.neon.log(
            `Passing control for type testing to HRequest instance.`
          );
          request.verifyPayloadAgainstTypeDefinition(types);
          HServer.neon.log(`Received control from HRequest instance.`);
        }

        HServer.neon.log(`Passing control to HEndpointHandler.`);
        await handler(request, response);
        HServer.neon.log(`Received control from HEndpointHandler.`);
      } else {
        HServer.neon.log("No endpoint could be found.");
        return response.error({
          code: HErrorStatusCode.NotFound,
          msg: "Path does not exist.",
          show: true,
        });
      }
    })().catch((err: any): void => {
      if (err instanceof HError) {
        HServer.neon.err(
          `${err.getStatusCode()} - ${err.getInternalStatusMessage()}`
        );
        return response.sendError(err);
      }
      HServer.neon.err(err);
      return response.error({
        code: HErrorStatusCode.InternalServerError,
        msg: "Internal Server Error.",
      });
    });
  }

  public abstract start(port: number, listener?: () => void): void;
}
