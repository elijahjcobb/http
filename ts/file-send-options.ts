import type { HMime } from "./mime";
import type { HFileSendType } from "./file-send-type";

export interface HFileSendOptions {
  type?: HFileSendType;
  name?: string;
  mime?: HMime;
  length?: number;
}
