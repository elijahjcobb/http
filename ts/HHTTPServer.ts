import { HServer, HServerConfig } from "./HServer";
import * as HTTP from "http";
import { HEndpointGroup } from "./HEndpointGroup";

export class HHTTPServer extends HServer {
  private server: HTTP.Server;

  public constructor(endpointGroup: HEndpointGroup, config?: HServerConfig) {
    super(endpointGroup, config);

    this.server = HTTP.createServer(this.rootHandler);
  }

  public start(port: number = 80, listener?: () => void): void {
    this.server.listen(port, listener);
  }
}
