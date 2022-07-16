import {
  HUploadManagerConstructorType,
  HUploadManagerLocation,
} from "./upload-manager";

export class HUploadManagerBuilder {
  private readonly _location: HUploadManagerLocation;
  private readonly _extensions: string[];
  private _size: number | undefined;

  private constructor(location: HUploadManagerLocation) {
    this._location = location;
    this._extensions = [];
  }

  public build(): HUploadManagerConstructorType {
    return {
      location: this._location,
      extensions: this._extensions,
      sizeLimit: this._size,
    };
  }

  public allow(...extensions: string[]): HUploadManagerBuilder {
    this._extensions.push(...extensions);
    return this;
  }

  public limit(size: number): HUploadManagerBuilder {
    this._size = size;
    return this;
  }

  public static payload(): HUploadManagerBuilder {
    return new HUploadManagerBuilder(HUploadManagerLocation.PAYLOAD);
  }
  public static stream(): HUploadManagerBuilder {
    return new HUploadManagerBuilder(HUploadManagerLocation.STREAM);
  }
}
