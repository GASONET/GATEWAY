export interface IPagosService {
    getPaymentMethod(payload:any): Promise<any>
    createUpdatePaymentMethod(payload:any): Promise<any>
}