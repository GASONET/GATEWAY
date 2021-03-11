import { ILogger } from '@services/logger'
import { LoggerService } from '@services/logger/loggerService'
import { Database } from '@database/database'
import { decrypt, encrypt, generateAuthorization } from '@helpers/crypto'
import crypto from 'crypto'
import { ILogginService } from '.'

const database = new Database()

export class LoginService implements ILogginService {
    private logger: ILogger
    constructor() {
        this.logger = new LoggerService()
    }

    public async loginUser(payload:string) {
        const data: any = await decrypt(payload)

        const user = data.user
        const pwd = data.pwd
        const userDB = await database.query('SELECT cli.tdi_id AS tipoDocumento, cli.cli_nro_documento AS documento, cli.cli_nombre AS nombre, de.USUARIO AS usuario, cli.cli_numero_contrato AS numeroContrato, de.CORREO_ELECTRONICO AS email FROM iev_servicios.clientes as cli INNER JOIN iev_web.detusu as de ON cli.cli_id=de.ID_ELEMENTO WHERE de.USUARIO = ? AND de.CONTRASENA=?', [user, pwd])
        if(!userDB[0]) {
            return {
                data: '',
                error: 'not found',
                status: 400,
            }
        }

        userDB[0].numeroContrato = crypto.createHash('sha256').update(userDB[0].numeroContrato).digest('hex')
        const authToken: any = await generateAuthorization({date: Date.now()})
        const encryptedResult: any = await encrypt({
            user: userDB[0],
            authorization: authToken,
        })
        return {
            data: encryptedResult,
            error: '',
            status: 200,
        }
    }
}
