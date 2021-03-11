import * as express from 'express'
import { Request, Response, NextFunction } from 'express'
import { LoggerService } from '@services/logger/loggerService'
import { loginModel } from './loginModel'
import { LoginService } from '@services/login/loginService'

const loginService = new LoginService()

export class LoginController {
    public path = '/login'
    public router = express.Router()
    public logger = new LoggerService()

    constructor() {
        this.initRoutes()
    }

    public initRoutes() {
        this.router.post(this.path, this.login)
    }

    private login = async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body
        const { error } = loginModel.validate(payload)
        if( error) {
            this.logger.error(`POST /v1/login - Invalid Request ${error}`)
            res.status(422).json({data: '', error: ['invalid request']})
            next()
            return
        }
        try {
            const result = await loginService.loginUser(payload.data)
            res.status(200).json({
                data: result
            })
            next()
            return
        } catch (error) {
            this.logger.error(`POST /v1/login - Error ${error}`)
            res.status(500).json({error: 'Internal server error'})
            next()
            return
        }
    }
}