import { Observable } from 'rxjs'
import { IRequestValidator } from '../../../common/interface/requst-validator'

export interface IUserService {
    create(input: any): Observable<any>

    update(id: string, input: any): Observable<any>

    list(page: number, limit: number): Observable<any>

    getUser(id: string): Observable<any>

    suspend(id: string): Observable<any>

    reactivate(id: string): Observable<any>

    verifyPassword(username: string, password: string): Observable<any>
}

export interface IUserValidator extends IRequestValidator {
    getName(): string

    getEmail(): string

    getPhone(): string

    getPassword(): string

    getSuspended(): boolean

}
