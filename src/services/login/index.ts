export interface ILogginService {
    loginUser(payload:string): Promise<any>
}