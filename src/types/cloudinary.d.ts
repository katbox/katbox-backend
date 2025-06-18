declare module "cloudinary" {
  export const v2: {
    config: (config: { cloud_name: string; api_key: string; api_secret: string }) => void;
    uploader: {
      upload: (file: string, options?: any) => Promise<any>;
      destroy: (public_id: string) => Promise<void>;
    };
  };
}

declare module "multer-storage-cloudinary" {
  import { Request } from "express";
  import { StorageEngine } from "multer";

  export class CloudinaryStorage implements StorageEngine {
    constructor(options: {
      cloudinary: any;
      params?:
        | {
            folder?: string;
            allowed_formats?: string[];
            transformation?: any[];
            public_id?: string;
          }
        | ((req: Request, file: Express.Multer.File) => Promise<{
            folder?: string;
            allowed_formats?: string[];
            transformation?: any[];
            public_id?: string;
          }>);
    });
    _handleFile(
      req: Request,
      file: Express.Multer.File,
      cb: (error?: any, info?: Partial<Express.Multer.File>) => void
    ): void;
    _removeFile(
      req: Request,
      file: Express.Multer.File,
      cb: (error?: any) => void
    ): void;
  }
}