import express from 'express'
import { Application } from 'express'
import fs from 'fs'
import helmet from 'helmet'
import cors from 'cors'
import bodyParser from 'body-parser'
import path from 'path'
import { LoggerService } from '@services/logger/loggerService'
import { AutorizeService } from '@services/autorizar/autorizarService'
// import { excludeRoutesMiddleware } from '~/middleware/excludeRoutes'
import { RegistrarService } from '@services/registrar/registrarService'
import { Database } from '@database/database'
import { listen } from 'soap'

const logger = new LoggerService()
const expressLogger = logger.getExpressLogger()
const autorizeService = new AutorizeService()
const registratService = new RegistrarService()
const database = new Database()

export default class App {
    public app: Application
    public port: number

    constructor(appInit: { port: number; middleWares:any; controllers: any;}) {
        this.app = express()
        this.port = appInit.port
        this.initApp()
        this.middlewares(appInit.middleWares)
        this.routes(appInit.controllers)
    }

    private initApp() {
        this.app.use(helmet())
        this.app.use(cors())
        this.app.use(bodyParser.json())
        this.app.use(expressLogger)
        this.app.use(bodyParser.urlencoded({ extended: false }))
        this.app.use(express.static(path.join(process.cwd(), 'public')))
    }

    private middlewares(middleWares: { forEach: (arg0: (middleWare: any) => void) => void; }) {
        middleWares.forEach(middleWare => {
            this.app.use(middleWare)
        })
    }


    private routes(controllers: { forEach: (arg0: (controller: any) => void) => void; }) {
        controllers.forEach(controller => {
            this.app.use('/v1', controller.router)
        })
        this.app.get('/', (req, res) => res.send('GASONET Gateway Server'))
    }


    public listen() {
        logger.info(`[server]: Server is running at http://localhost:${this.port}`)
        this.app.listen(this.port, () => {
            const autorizarXml = fs.readFileSync(process.env.WSDL_DIR + 'AutorizarTransaccionEjb.wsdl', 'utf8')
            const registrarXml = fs.readFileSync(process.env.WSDL_DIR + 'RegistrarContratoEjb.wsdl', 'utf8')

            listen(this.app, '/AutorizarTransaccionService', autorizeService.soapServiceAutorizar(), autorizarXml, async (err: any, res: any) => {
                if (err) {
                    logger.error('ERROR ', err)
                }
                else {
                    logger.info('SOAP web service Autorizar started on ', this.port)
                }
            })

            listen(this.app,'/RegistrarContratoService', registratService.soapServiceRegistrar(), registrarXml, async (err: any, res: any) => {
                if (err) {
                    logger.error('ERROR ', err)
                }
                else {
                    logger.info('SOAP web service Registrar started on ', this.port)
                }
            })
            
        })
    }
}

