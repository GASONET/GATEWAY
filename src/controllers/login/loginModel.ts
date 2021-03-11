import joi from 'joi'

export const loginModel = joi.object({
    data: joi.string().required()
})