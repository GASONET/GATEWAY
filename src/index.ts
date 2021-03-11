require('module-alias/register')
import dotenv from 'dotenv'
dotenv.config()

import App from '~/app'
import { LoginController } from '@controllers/login/loginController'
import { PagosController } from '@controllers/pagos/pagosController'
import { authMiddleware } from '~/middleware/auth'

const PORT = process.env.SERVER_PORT || 3000
const app =  new App({ port: Number(PORT), middleWares:[authMiddleware], controllers: [ new LoginController(), new PagosController()],})

app.listen()