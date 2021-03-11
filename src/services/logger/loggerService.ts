/* eslint-disable @typescript-eslint/no-explicit-any*/
/* eslint-disable @typescript-eslint/explicit-module-boundary-types*/
import { configure, Logger } from 'log4js'
import morgan from 'morgan'
import { ILogger } from '.'

export class LoggerService implements ILogger {
    public defaultLogger: Logger
    public expressLogger: Logger
    private level: string
    
    constructor() {
        this.level = process.env.LOGGER_LEVEL ? process.env.LOGGER_LEVEL : 'debug'
        const configLog = configure({
            appenders: {
                out: { type: 'console' },
            },
            categories: {
                default: { appenders: ['out'], level: this.level },
                express: { appenders: ['out'], level: this.level },
            }
        })

        this.defaultLogger = configLog.getLogger('default')
        this.expressLogger = configLog.getLogger('express')
    }
  
    public debug(message:any, ...args: any[]):void {
        this.defaultLogger.debug(message, ...args)
    }

    public info(message:any, ...args: any[]):void {
        this.defaultLogger.info(message, ...args)
    }

    public error(message:any, ...args: any[]):void {
        this.defaultLogger.error(message, ...args)
    }

    public getExpressLogger = () => {
        return morgan(
            ':method :url HTTP/:http-version | :status | :response-time ms | :res[content-length]', 
            {
                stream: {
                    write: this.logStream
                }
            }
        )
    }

    public logStream = (message:string) => {
        const status = Number(message.split(' | ')[1])
        if(status < 400) this.expressLogger.info(message.trim())
        else this.expressLogger.error(message.trim())
    }
}