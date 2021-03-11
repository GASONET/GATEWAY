import mysql from 'mysql'
import { LoggerService } from '@services/logger/loggerService'
import { IDatabase } from '.'

export class Database implements IDatabase {
    public mysqlDB: any
    public logger = new LoggerService()
    public conn: any

    constructor() {
        this.mysqlDB = mysql
        this.connection()
    }

    public connection() {
        try {
            this.conn = this.mysqlDB.createConnection({
                host: process.env.HOST,
                user: process.env.USER_DB,
                password: process.env.PWD_DB,
            })
            this.conn.connect((err: any) => {
                if (err) {
                    this.logger.error('error connecting: ' + err.stack)
                    return
                }
                this.logger.info('\x1b[34mDATABASE\x1b[0m', '\x1b[32m ONLINE \x1b[0m ', + this.conn.threadId)
            })
            this.conn.on('error', (err:any) => {
                this.logger.info('error ', err)
                if (err.code == 'PROTOCOL_CONNECTION_LOST') {   // Connection to the MySQL server is usually
                    this.connection()                           // lost due to either server restart, or a
                } else {                                        // connnection idle timeout (the wait_timeout
                    throw err                                   // server variable configures this)
                }
            })
        } catch (error) {
            this.logger.error('error connecting DB: ' + error)
            return
        }
    }

    public query(query:string, values:any): Promise<any> {
        return new Promise( (resolve:any, reject:any) => {
            this.conn.query(query,values, (error:any, results:any, fields:any) => {
                if (error) {
                    reject(new Error(error))
                }
                resolve(results)
            })
        })
    }

    

}
