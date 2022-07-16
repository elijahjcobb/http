import { HMime } from "./HMime";
import { HFileSendType } from "./HFileSendType";

export interface HFileSendOptions {
  type?: HFileSendType;
  name?: string;
  mime?: HMime;
  length?: number;
}
