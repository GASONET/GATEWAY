import joi from 'joi'

export const reqAuthorizationSchema = joi.object({
    codigoVerificacion: joi.string().required(),
    idCanal: joi.string().required(),
    idOrganizacion: joi.number().required(),
    origen: joi.string().optional(),
    usuario: joi.string().optional(),
    codigoComercio: joi.string().required(),
    codigoEstacion: joi.string().required(),
    numeroContrato: joi.string().required(),
    numeroControl: joi.string().required(),
    numeroTerminal: joi.string().required(),
    referencia: joi.string().required(),
    rom: joi.string().required(),
    valorTransaccion: joi.number().required(),
})


export const reqAnularSchema = joi.object({
    codigoVerificacion: joi.string().optional(),
    idCanal: joi.string().required(),
    idOrganizacion: joi.number().required(),        
    origen: joi.string().optional(),
    usuario: joi.string().optional(),
    codigoComercio: joi.string().required(),
    codigoEstacion: joi.string().required(),
    numeroAutorizacionTx: joi.string().required(),
    numeroContrato: joi.string().required(),
    numeroControl: joi.string().required(),
    numeroTerminal: joi.string().required(),
    numeroTx: joi.string().required(),
    referencia: joi.string().required(),
    rom: joi.string().required(),
    valorTransaccion: joi.number().required(),
})

export const reqRegistroSchema = joi.object({
    codigoVerificacion: joi.string().optional(),
    idCanal: joi.string().required(),
    idOrganizacion: joi.number().required(),        
    origen: joi.string().optional(),
    usuario: joi.string().optional(),
    numeroContrato: joi.string().required(),
    numeroAuditoria: joi.string().required(),
    numeroIdentificacion: joi.string().required(),
    tipoIdentificacion: joi.string().required(),
})