import * as HTTP from "http";
import { HServer } from "./server";
import type { HServerConfig } from "./server";
import type { HEndpointGroup } from "./endpoint-group";

export class HHTTPServer extends HServer {
  private server: HTTP.Server;

  public constructor(endpointGroup: HEndpointGroup, config?: HServerConfig) {
    super(endpointGroup, config);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.server = HTTP.createServer(this.rootHandler);
  }

  public start(port = 80, listener?: () => void): void {
    this.server.listen(port, listener);
  }
}
