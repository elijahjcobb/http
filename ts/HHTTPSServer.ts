import { HServer, HServerConfig } from "./HServer";
import { HEndpointGroup } from "./HEndpointGroup";
import * as HTTPS from "https";

export class HHTTPSServer extends HServer {
  private server: HTTPS.Server;

  public constructor(
    endpointGroup: HEndpointGroup,
    key: Buffer,
    cert: Buffer,
    config?: HServerConfig
  ) {
    super(endpointGroup, config);

    this.server = HTTPS.createServer({ key, cert }, this.rootHandler);
  }

  public start(port: number = 443, listener?: () => void): void {
    this.server.listen(port, listener);
  }
}
