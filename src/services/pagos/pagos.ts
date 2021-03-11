import { ILogger } from '@services/logger'
import { LoggerService } from '@services/logger/loggerService'
import { callRestServer, callTokenSesionReg } from '@helpers/httpRequest'
import { IPagosService } from '.'
import { decrypt, encrypt } from '@helpers/crypto'

export class PaymentMethodService implements IPagosService {
    private logger: ILogger
    constructor() {
        this.logger = new LoggerService()
    }

    public async getPaymentMethod(payload: any): Promise<any> {
        try {
            const data: any = await decrypt(payload)
            const res = await this.consultarMetodoPagoRest(data)
            return res
        } catch (error) {
            this.logger.error(`Error ${JSON.stringify(error)}`)
            return error
        }

    }

    public async createUpdatePaymentMethod(payload: any): Promise<any> {
        try {
            const data: any = await decrypt(payload)
            const tokenDataNumero = {
                tipoDato: 1,
                dato: data.numeroTarjeta
            }
            let numeroTarjeta = ''
            let fechaVencimiento = ''
            let auth = ''
            const tokenTarjeta = await this.tokenizarDataRest(tokenDataNumero, '')
            if (!tokenTarjeta.datoRespuesta || !tokenTarjeta.auth) {
                return {
                    status: 500,
                    data: '',
                    errors: 'error tokenizing data'
                }
            }
            auth = tokenTarjeta.auth
            numeroTarjeta = tokenTarjeta.datoRespuesta
            const tokenDataFecha = {
                tipoDato: 3,
                dato: data.fechaVencimiento
            }
            const tokenFecha = await this.tokenizarDataRest(tokenDataFecha, auth)
            if (!tokenFecha.datoRespuesta) {
                return {
                    status: 500,
                    data: '',
                    errors: 'error tokenizing data'
                }
            }
            fechaVencimiento = tokenFecha.datoRespuesta
            data.numeroTarjeta = numeroTarjeta
            data.fechaVencimiento = fechaVencimiento
            return await this.crearActualizarMetodoPagoRest(data, auth)
        } catch (error) {
            this.logger.error(`Error ${JSON.stringify(error)}`)
            return error
        }

    }

    private async consultarMetodoPagoRest(payload: any): Promise<any> {
        const numeroAuditoria = Date.now()
        const { data } = await callTokenSesionReg({}, '84940ab337b134c882a4e3e8b9ca91fe8095ad6dd34588f7752b7631232ed9c2')
        const callData = {
            mediopago: {
                canal: 3,
                idOrganizacion: 14,
                numeroAuditoria: String(numeroAuditoria),
                numeroContrato: payload.numeroContrato,
                mostrarToken : true
            }
        }
        try {
            const response: any = await callRestServer(String(`${process.env.REST_URL}mediopago/consultarmediopagomp`), callData, data.datoRespuesta)
            const encryptedResult: any = await encrypt({
                code: response.codigoRespuesta,
                medios: response.medios ? this.getMedios(response.medios) : [],
                errors: ''
            })
            return {
                status: 200,
                data: encryptedResult,
                errors: '',
            }
        } catch (error) {
            return {
                status: 500,
                data: '',
                errors: error
            }
        }
    }

    private async crearActualizarMetodoPagoRest(payload: any, auth: string): Promise<any> {
        const numeroAuditoria = Date.now()
        // const { data } = await callTokenSesionReg({}, '84940ab337b134c882a4e3e8b9ca91fe8095ad6dd34588f7752b7631232ed9c2')
        const url: string = payload.create ? 'mediopago/adicionarmediopagomp' : 'mediopago/modificarmediopagomp'
        const callData = {
            mediopago: {
                canal: 3,
                idOrganizacion: 14,
                numeroAuditoria: String(numeroAuditoria),
                numeroContrato: payload.numeroContrato,
                tipoMedio: 3,
                franquicia: payload.franquicia,
                numeroTarjeta: payload.numeroTarjeta,
                fechaVencimiento: payload.fechaVencimiento,
            }
        }
        try {
            const response: any = await callRestServer(process.env.REST_URL + url, callData, auth)//data.datoRespuesta)
            const encryptedResult: any = await encrypt({
                code: response.codigoRespuesta,
                message: response.mensajeRespuesta
            })
            return {
                status: 200,
                data: encryptedResult,
                errors: '',
            }
        } catch (error) {
            return {
                status: 500,
                data: '',
                errors: error
            }
        }
    }

    private async tokenizarDataRest(payload: any, auth: string): Promise<any> {
        const numeroAuditoria = Date.now()
        if (!auth) {
            const { data } = await callTokenSesionReg({}, '84940ab337b134c882a4e3e8b9ca91fe8095ad6dd34588f7752b7631232ed9c2')
            auth = data.datoRespuesta
        }
        const callData = {
            token: {
                canal: 3,
                idOrganizacion: 14,
                numeroAuditoria: String(numeroAuditoria),
                tipoDato: payload.tipoDato,
                dato: payload.dato,
            }
        }
        try {
            const response: any = await callRestServer(`${process.env.REST_URL}token/generartoken`, callData, auth)
            if (response.datoRespuesta && response.codigoRespuesta == '0') {
                return {
                    datoRespuesta: response.datoRespuesta,
                    auth: auth
                }
            }
            else return {
                datoRespuesta: false,
                auth: false
            }
        } catch (error) {
            console.log(error)
            return {
                datoRespuesta: false,
                auth: false
            }
        }
    }

    private getMedios = (medios: any[]) => {
        const userPaymentMethods: any[] = []
        let index = 1
        for (const paymentMethod of medios) {
            if (paymentMethod.franquicia && paymentMethod.numeroTarjeta) {
                userPaymentMethods.push({
                    id: index,
                    franquicia: paymentMethod.franquicia, 
                    numeroTarjeta: paymentMethod.numeroTarjeta,
                })
                index ++
            }
        }
        return userPaymentMethods
    }
}
