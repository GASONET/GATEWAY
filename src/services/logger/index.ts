/* eslint-disable @typescript-eslint/no-explicit-any*/
export interface ILogger {
    debug(message: any, ...args: any[]):void
    info(message: any, ...args: any[]):void
    error(message: any, ...args: any[]):void
    getExpressLogger(): any
}