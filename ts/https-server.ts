import * as HTTPS from "https";
import { HServer } from "./server";
import type { HServerConfig } from "./server";
import type { HEndpointGroup } from "./endpoint-group";

export class HHTTPSServer extends HServer {
  private server: HTTPS.Server;

  public constructor(
    endpointGroup: HEndpointGroup,
    key: Buffer,
    cert: Buffer,
    config?: HServerConfig
  ) {
    super(endpointGroup, config);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.server = HTTPS.createServer({ key, cert }, this.rootHandler);
  }

  public start(port = 443, listener?: () => void): void {
    this.server.listen(port, listener);
  }
}
