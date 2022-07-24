import { Observable } from 'rxjs'
import { IRole } from './role'

export interface IRoleRepository {
    getByID(id: string): Observable<IRole>
    searchByName(name: string): Observable<IRole>
    save(model: IRole): Observable<any>
    update(model: IRole): Observable<any>
    delete(role: IRole): Observable<any>
    list(page: number, limit: number): Observable<any>
    total(): Observable<number>
}
