import {
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common'
import { MongoRepository } from '../common/mongo-repository'
import {
    Db,
    ObjectID,
} from 'mongodb'
import {
    from,
    Observable,
} from 'rxjs'
import { IRepositoryMapping } from '../common/interface/repository'
import { IEvent } from '../domain/event/interface/event'
import * as _ from 'lodash'
import { plainToClass } from 'class-transformer'
import { EventModel } from '../domain/event/event.model'
import { IEventRepository } from '../domain/event/interface/repository'
import { map } from 'rxjs/operators'
import { IRole } from '../domain/role/interface/role'

@Injectable()
// TODO implement IEvent
export class EventMongoRepository extends MongoRepository<IEvent> implements IEventRepository {
    constructor(db: Db) {
        super(db.collection('event'), new EventMongoRepositoryMapping())
    }

    public save(model: IEvent): Observable<any> {
        const document = this._mapper.serialize(model)
        return from(this._collection.insertOne(document)).pipe(
            map((resp: any) => {
                console.log(resp.insertedId)
                if (_.get(resp, 'result.n') === 1) {
                    return {
                        id: resp.insertedId,
                    }
                }
                throw new HttpException(`Save Error`, HttpStatus.INTERNAL_SERVER_ERROR)
            }),
        )
    }

    public getById(id: string): Observable<IEvent> {
        const query = {
            _id: new ObjectID(id),
        }
        return from(this._collection.findOne(query)).pipe(
            map((doc: any) => this._mapper.deserialize(doc)),
        )
    }

    public update(model: IEvent): Observable<any> {
        const document = this._mapper.serialize(model)

        return from(this._collection.updateOne(
            {
                _id: model.getId(),
            }, {
                $set: document,
            }),
        ).pipe(
            map((resp: any) => {
                if (_.get(resp, 'result.n') === 1) {
                    return {
                        id: model.getId(),
                    }
                }
                throw new HttpException(`Update Error`, HttpStatus.INTERNAL_SERVER_ERROR)
            }),
        )
    }

    public delete(model: IEvent): Observable<any> {
        return from(this._collection.deleteOne({
            _id: model.getId(),
        }))
    }
}

export class EventMongoRepositoryMapping implements IRepositoryMapping<IEvent> {
    public deserialize(obj: any): IEvent {
        if (_.isNil(obj)) {
            return null
        }
        const model = new EventModel(obj.name)
        return _.assign(model, {
            _id: obj._id,
            _subtitle: obj.subtitle,
            _address1: obj.address1,
            _address2: obj.address2,
            _bannerPath: obj.bannerPath,
            _enforceMax: obj.enforceMax === 'true',
            _logoPath: obj.logoPath,
            _maxSeats: obj.maxSeats,
            _note: obj.note,
            _registerEnd: obj.registerEnd,
            _registerStart: obj.registerStart,
            _startDate: obj.startDate,
            _endDate: obj.endDate,
            _template: obj.template,
            _allDay: obj.allDay,
            _allowWalkIn: obj.allowWalkIn,
            _activated: obj.activated,
            _timeBegin: obj.timeBegin,
            _timeEnd: obj.timeEnd,
            _secret: obj.secret,
            _hero: obj.hero,
            _inviteText: obj.inviteText,
            _docPath: obj.docPath,
        })
    }

    public serialize(model: IEvent): any {
        return {
            _id: model.getId(),
            subtitle: model.getSubtitle(),
            address1: model.getAddress1(),
            address2: model.getAddress2(),
            secret: model.getSecret(),
            name: model.getName(),
            bannerPath: model.getBannerPath(),
            enforceMax: model.getEnforceMax(),
            // logoPath: model.getLogoPath(),
            maxSeats: model.getMaxSeats(),
            note: model.getNote() || '',
            registerEnd: model.getRegisterEndDate(),
            registerStart: model.getRegisterStartDate(),
            startDate: model.getStartDate(),
            endDate: model.getEndDate(),
            template: model.getTemplate(),
            allDay: model.isAllDay(),
            allowWalkIn: model.isAllowWalkIn(),
            activated: model.isActivated(),
            timeBegin: model.getEventTimeBegin() || '',
            timeEnd: model.getEventTimeEnd() || '',
            hero: model.getHero() || '',
            inviteText: model.getInviteText() || '',
        }
    }

}
