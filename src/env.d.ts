declare namespace NodeJS {
  interface ProcessEnv {
    readonly PORT: string;
    readonly MONGO_URI: string;
    readonly JWT_KEY: string;
    readonly BUCKET_NAME: string;
    readonly BUCKET_REGION: string;
    readonly ACCESS_KEY: string;
    readonly SECRET_ACCESS_KEY: string;
  }
}
