import axios from 'axios'
import { string } from 'joi'
import jwt from 'jsonwebtoken'

export const decrypt = (data: any) => {
    return new Promise((resolve: any, reject: any) => {

        axios.post(`${String(process.env.AUTH_URL)}auth/v1/verify-token`, {data: data})
            .then((response: any) => {
                if (response.data) resolve(response.data)
                else resolve(false)
            })
            .catch((error: any) => {
                reject(error)
            })
    })
}

export const encrypt = (data: any) => {
    return new Promise((resolve: any, reject: any) => {

        axios.post(`${String(process.env.AUTH_URL)}auth/v1/token`, data)
            .then((response: any) => {
                if (response.data) resolve(response.data)
                else resolve(false)
            })
            .catch((error: any) => {
                reject(error)
            })
    })
}

export const generateAuthorization = (payload: any) => {
    return new Promise((resolve: any, reject: any) => {
        const SECRET_SEED: any = process.env.SEED
        const TOKEN_EXP: string = String(process.env.TOKEN_EXP) || '15m'
        try {
            return resolve(jwt.sign(payload, SECRET_SEED, { expiresIn: TOKEN_EXP }))
        } catch (error) {
            reject(error)
        }
    })
}