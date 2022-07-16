import { HFileSendType } from "./file-send-type";

export const HFileSendTypeHelper = {
  typeToString: (value: HFileSendType | undefined): string => {
    if (value === HFileSendType.PREVIEW) return "inline";
    return "attachment";
  },
  stringToType: (value: string): HFileSendType => {
    if (value === "inline") return HFileSendType.PREVIEW;
    return HFileSendType.DOWNLOAD;
  },
};
