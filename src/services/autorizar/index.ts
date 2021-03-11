export interface IAutorizeService {
    autorizeSoap(payload: any): Promise<any>
}