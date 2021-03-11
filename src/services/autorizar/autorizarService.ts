import { createClient } from 'soap'
import { ILogger } from '@services/logger'
import { LoggerService } from '@services/logger/loggerService'
import { callTokenSesion, callRestServer } from '@helpers/httpRequest'
import util from 'util'
import crypto from 'crypto'
import { IAutorizeService } from '.'
import { reqAuthorizationSchema, reqAnularSchema } from '@models/reqBody.model'

export class AutorizeService implements IAutorizeService {
    private logger: ILogger
    private soapClient: any
    constructor() {
        this.logger = new LoggerService()
        this.soapClient = util.promisify(createClient)
    }

    public async autorizeSoap(payload: any): Promise<any> {
        const dir = process.env.WSDL_DIR
        const wsdl = `${dir}AutorizarTransaccionEjb.wsdl`

        try {
            const client: any = await this.soapClient(wsdl)
            if (client) {
                const Reversar = util.promisify(client.Autorizar)
                const res = await Reversar(payload)
                this.logger.info(res)
                return
            }
        } catch (error) {
            this.logger.error(`Error ${JSON.stringify(error)}`)
            return error
        }
    }

    public soapServiceAutorizar() {
        return {
            AutorizarTransaccionService: {
                AutorizarTransaccionEjbPort: {
                    Autorizar: async (args: any) => {
                        const { error } = reqAuthorizationSchema.validate(args.dto)
                        if (error) {
                            this.logger.error(`SOAP /AutorizarTransaccionService [Anular] - Invalid Request ${error}`)
                            throw {
                                Fault: {
                                  Code: {
                                    Value: 'soap:Sender',
                                  },
                                  Reason: { Text: 'invalid request' },
                                  statusCode: 400
                                }
                            }
                        }
                        const responseRest = await this.autorizarRest(args.dto)
                        if(responseRest.errors === '') {
                            return responseRest.data
                        }
                        else {
                            this.logger.error('SOAP /AutorizarTransaccionService [Autorizar] - Error')
                            throw {
                                Fault: {
                                  Code: {
                                    Value: 'soap:Sender',
                                  },
                                  Reason: { Text: 'Error de respuesta del servidor' },
                                  statusCode: 400
                                }
                            }
                        }
                    },
                    Reversar: async (args: any) => {
                        const { error } = reqAnularSchema.validate(args.dto)
                        if (error) {
                            this.logger.error(`SOAP /AutorizarTransaccionService [Anular] - Invalid Request ${error}`)
                            throw {
                                Fault: {
                                  Code: {
                                    Value: 'dto: invalid request',
                                  },
                                  Reason: { Text: 'invalid request' },
                                  statusCode: 422
                                }
                            }
                        }
                        const responseRest = await this.anularRest(args.dto)
                        if(responseRest.errors === '') {
                            return responseRest.data
                        }
                        else {
                            this.logger.error('SOAP /AutorizarTransaccionService [Anular] - Error')
                            throw {
                                Fault: {
                                  Code: {
                                    Value: 'soap:Sender',
                                  },
                                  Reason: { Text: 'Error de respuesta del servidor' },
                                  statusCode: 400
                                }
                            }
                        }
                    },
                }
            },
        }
    }

    private async autorizarRest(dataDto: any): Promise<any> {
        const { data } = await callTokenSesion({}, '04ed93513cb4d43d0d33acee155fee8d596e67066bb68ee21e62964384dda195')
        const callData = {
            autorizar: {
                canal: 3,
                cuotas: 1,
                idOrganizacion: dataDto.idOrganizacion,
                numeroAuditoria: 1609379233386,
                codigoComercio: Number(dataDto.codigoComercio),
                codigoEstacion: Number(dataDto.codigoEstacion),
                numeroContrato: crypto.createHash('sha256').update(dataDto.numeroContrato).digest('hex'),
                numeroControl: Number(dataDto.numeroControl),
                numeroTx: Number(dataDto.numeroControl),
                referencia: dataDto.referencia,
                valorTransaccion: Number(dataDto.valorTransaccion)
            }
        }

        try {
            const response: any = await callRestServer(String(`${process.env.REST_URL}tx/autorizar`), callData, data.datoRespuesta)
            return {
                data: {
                    return: {
                        codigoRespuesta: response.codigoRespuesta,
                        fechaTransaccion: response.fechaTransaccion,
                        franquicia: response.franquicia,
                        mensajeRespuesta: response.mensajeRespuesta,
                        numeroAuditoria: response.numeroAuditoria,
                        numeroAutorizacion: response.numeroAutorizacion,
                        numeroTxRed: response.numeroTxRed,
                        red: response.red,
                        referencia: response.referencia,
                        terminal: response.terminal,
                        tipoMedio: response.tipoMedio,
                        valorTransaccion: response.valorTransaccion,
                        numeroTarjeta: '0000'
                    }
                },
                errors: '',
            }
        } catch (error) {
            return {
                data: '',
                errors: error
            }
        }
    }

    private async anularRest(dataDto: any): Promise<any> {
        const { data } = await callTokenSesion({}, '04ed93513cb4d43d0d33acee155fee8d596e67066bb68ee21e62964384dda195')
        const callData = {
            autorizar: {
                canal: 3,
                cuotas: 1,
                idOrganizacion: Number(dataDto.idOrganizacion),
                codigoComercio: Number(dataDto.codigoComercio),
                codigoEstacion: Number(dataDto.codigoEstacion),
                numeroContrato: crypto.createHash('sha256').update(dataDto.numeroContrato).digest('hex'),
                numeroControl: Number(dataDto.numeroControl),
                referencia: dataDto.referencia,
                valorTransaccion: Number(dataDto.valorTransaccion),
                idNumeroTxAnterior: dataDto.numeroTx,
                numeroAutorizacion: Number(dataDto.numeroAutorizacionTx),
                numeroTx: Number(dataDto.numeroControl),
                numeroAuditoria: 1609379233386,             
            }
        }

        try {
            const response: any = await callRestServer(String(`${process.env.REST_URL}tx/anular`), callData, data.datoRespuesta)
            return {
                data: {
                    return: {
                        codigoRespuesta: response.codigoRespuesta,
                        fechaTransaccion: response.fechaTransaccion,
                        mensajeRespuesta: response.mensajeRespuesta,
                        franquicia: response.franquicia,
                        numeroAutorizacion: response.numeroAutorizacion,
                        numeroTarjeta: '0000',
                        numeroTxRed: response.numeroTxRed,
                        red: response.red,
                        terminal: response.terminal,
                        tipoMedio: response.tipoMedio,
                        valorTransaccion: response.valorTransaccion,   
                    }
                },
                errors: '',
            }
        } catch (error) {
            return {
                data: '',
                errors: error
            }
        }
    }
}
