export enum HMethod {
  GET,
  POST,
  PUT,
  DELETE,
  UNKNOWN,
}

export const HMethodHelper = {
  methodFromString(method: string): HMethod {
    switch (method) {
      case "GET":
        return HMethod.GET;
      case "POST":
        return HMethod.POST;
      case "PUT":
        return HMethod.PUT;
      case "DELETE":
        return HMethod.DELETE;
      default:
        return HMethod.UNKNOWN;
    }
  },
  stringFromMethod(method: HMethod): string {
    switch (method) {
      case HMethod.GET:
        return "GET";
      case HMethod.POST:
        return "POST";
      case HMethod.PUT:
        return "PUT";
      case HMethod.DELETE:
        return "DELETE";
      default:
        return "UNKNOWN";
    }
  },
};
