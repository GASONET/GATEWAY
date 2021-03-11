import { createClient } from 'soap'
import { ILogger } from '@services/logger'
import { LoggerService } from '@services/logger/loggerService'
import { callRestServer, callTokenSesionReg } from '@helpers/httpRequest'
import util from 'util'
import crypto from 'crypto'
import { IRegisterService } from '.'
import { reqRegistroSchema } from '@models/reqBody.model'

export class RegistrarService implements IRegisterService {
    private logger: ILogger
    private soapClient: any
    constructor() {
        this.logger = new LoggerService()
        this.soapClient = util.promisify(createClient)
    }

    public async registerSoap(payload: any): Promise<any> {
        const dir = process.env.WSDL_DIR
        const wsdl = `${dir}RegistrarContratoEjb.wsdl`

        try {
            const client: any = await this.soapClient(wsdl)
            if (client) {
                const Registrar = util.promisify(client.Registrar)
                const res = await Registrar(payload)
                this.logger.info(res)
                return
            }
        } catch (error) {
            this.logger.error(`Error ${JSON.stringify(error)}`)
            return error
        }

    }

    public soapServiceRegistrar() {
        return {
            RegistrarContratoService: {
                RegistrarContratoEjbPort: {
                    RegistroNumeroContrato: async (args: any) => {
                        const { error } = reqRegistroSchema.validate(args.dto)
                        if (error) {
                            this.logger.error(`SOAP /RegistrarContratoService - Invalid Request ${error}`)
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
                        const responseRest = await this.registrarRest(args.dto)
                        if(responseRest.errors === '') {
                            return responseRest.data
                        }
                        else {
                            this.logger.error('SOAP /RegistrarContratoService - Error')
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

    private async registrarRest(dataDto: any): Promise<any> {
        const { data } = await callTokenSesionReg({}, '84940ab337b134c882a4e3e8b9ca91fe8095ad6dd34588f7752b7631232ed9c2')
        const callData = {
            contrato: {
                canal: 3,
                idOrganizacion: dataDto.idOrganizacion,
                numeroContrato: dataDto.numeroContrato, //crypto.createHash('sha256').update(dataDto.numeroContrato).digest('hex'),
                tipoIdentificacion: Number(dataDto.tipoIdentificacion),
                numeroAuditoria: dataDto.numeroAuditoria,
                numeroIdentificacion: dataDto.numeroIdentificacion,
            }
        }

        const date: string = new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString()

        try {
            const response: any = await callRestServer(String(`${process.env.REST_URL}contrato/adicionarcontrato`), callData, data.datoRespuesta)
            return {
                data: {
                    return: {
                        codigoRespuesta: response.codigoRespuesta,
                        fechaTransaccion: date,
                        franquicia: response.franquicia,
                        mensajeRespuesta: response.mensajeRespuesta,
                        hashRom: crypto.createHash('sha256').update(dataDto.numeroContrato).digest('hex'),
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
