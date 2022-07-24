import { IRepository } from '../../../common/interface/repository'
import { Observable } from 'rxjs'
import { IEvent } from './event'

export interface IEventRepository extends IRepository<IEvent> {
    list(page: number, limit: number): Observable<IEvent>

    getById(id: string): Observable<IEvent>

    save(model: IEvent): Observable<any>

    update(model: IEvent): Observable<any>

    delete(model: IEvent): Observable<any>
}
