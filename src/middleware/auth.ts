import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/v1/login' || req.path === '/AutorizarTransaccionService' || req.path === '/RegistrarContratoService'  )  {
        next()
    }
    else {
        const auth: any = req.get('Authorization')
        if(!auth) 
            return res.status(401).json({
                status: 401,
                message: 'Unauthorized',
                error: 'auth error'
            })
        try {
            const data: any = await verfyJWT(auth)
            if (data === null) {
                return res.status(401).json({
                    status: 401,
                    message: 'Unauthorized',
                    error: 'auth error'
                })
            } else if (!data.date) {
                return res.status(401).json({
                    status: 401,
                    message: 'Unauthorized',
                    error: 'auth error'
                })
            }
            next()
        } catch (error) {
            console.log('Error middleware', error)
            // hacer los handlings pertinentes 
            return res.status(401).json({
                status: 401,
                message: 'Unauthorized',
                error: 'auth error'
            })
        }
    }
}

const verfyJWT = (auth: string) => {
    const SECRET_SEED: any = process.env.SEED
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve: any, reject: any) => {
        await jwt.verify(auth, SECRET_SEED, (error: any, decoded: any) => {
            if (error) {
              reject(error)
            } 
            resolve(decoded)
        })
    })
}