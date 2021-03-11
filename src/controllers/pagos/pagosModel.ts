import joi from 'joi'

export const consultarMetodoPagoSchema = joi.object({
    data: joi.string().required()
})
export const crearModificarMetodoPagoSchema = joi.object({
    data: joi.string().required()
})