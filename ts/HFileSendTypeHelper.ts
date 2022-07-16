import { HFileSendType } from "./HFileSendType";

export abstract class HFileSendTypeHelper {
  public static typeToString(value: HFileSendType | undefined): string {
    if (value === HFileSendType.PREVIEW) return "inline";
    else return "attachment";
  }

  public static stringToType(value: string): HFileSendType {
    if (value === "inline") return HFileSendType.PREVIEW;
    else return HFileSendType.DOWNLOAD;
  }
}
