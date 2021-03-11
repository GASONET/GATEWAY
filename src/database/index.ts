export interface IDatabase {
    connection(): void
    query(query:string, values:any): Promise<any>
}