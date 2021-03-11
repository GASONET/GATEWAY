import * as express from 'express'
import { Request, Response, NextFunction } from 'express'
import { LoggerService } from '@services/logger/loggerService'
import { consultarMetodoPagoSchema, crearModificarMetodoPagoSchema } from './pagosModel'
import { PaymentMethodService } from '@services/pagos/pagos'

const pagosService = new PaymentMethodService()

export class PagosController {
    public path = '/pagos'
    public router = express.Router()
    public logger = new LoggerService()

    constructor() {
        this.initRoutes()
    }

    public initRoutes() {
        this.router.post(`${this.path}/consultarMedioPago`, this.consultarMedioPago)
        this.router.post(`${this.path}/adicionarMedioPago`, this.adicionarMedioPago)
        this.router.post(`${this.path}/modificarMedioPago`, this.modificarMedioPago)
    }

    private consultarMedioPago = async(req: Request, res: Response, next: NextFunction) => {
        const payload = req.body
        const { error } = consultarMetodoPagoSchema.validate(payload)
        if( error) {
            this.logger.error(`POST /v1/pagos/consultarMedioPago - Invalid Request ${error}`)
            res.status(422).json({data: '', error: ['invalid request']})
            next()
            return
        }
        try {
            const result = await pagosService.getPaymentMethod(payload.data)
            res.status(result.status).json({
                data: result
            })
            next()
            return
        } catch (error) {
            this.logger.error(`POST /v1/pagos/consultarMedioPago - Error ${error}`)
            res.status(500).json(error)
            next()
            return
        }
    }

    private adicionarMedioPago = async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body
        const { error } = crearModificarMetodoPagoSchema.validate(payload)
        if( error) {
            this.logger.error(`POST /v1/pagos/adicionarMedioPago - Invalid Request ${error}`)
            res.status(422).json({data: '', errors: ['invalid request']})
            next()
            return
        }

        try {
            const result = await pagosService.createUpdatePaymentMethod(payload.data)
            res.status(result.status).json({
                data: result
            })
            next()
            return
        } catch (error) {
            this.logger.error(`POST /v1/pagos/adicionarMedioPago  - Error ${error}`)
            res.status(500).json({error: 'Internal server error'})
            next()
            return
        }
    }

    private modificarMedioPago = async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body
        const { error } = crearModificarMetodoPagoSchema.validate(payload)
        if( error) {
            this.logger.error(`POST /v1/pagos/modificarMedioPago - Invalid Request ${error}`)
            res.status(422).json({data: '', errors: ['invalid request']})
            next()
            return
        }
        try {
            const result = await pagosService.createUpdatePaymentMethod(payload.data)
            res.status(result.status).json({
                data: result
            })
            next()
            return
        } catch (error) {
            this.logger.error(`POST /v1/pagos/modificarMedioPago  - Error ${error}`)
            res.status(500).json({error: 'Internal server error'})
            next()
            return
        }
    }
}