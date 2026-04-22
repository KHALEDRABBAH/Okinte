// Prisma 7 client type declarations
// This resolves TS7016 for @prisma/client when using the driver adapter pattern
declare module '@prisma/client' {
  export class PrismaClient {
    constructor(options?: any);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $transaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T>;
    $transaction<T>(promises: Promise<T>[]): Promise<T[]>;
    user: any;
    application: any;
    document: any;
    payment: any;
    service: any;
    message: any;
    partner: any;
    webhookEvent: any;
    promoCode: any;
    chatMessage: any;
  }
}
