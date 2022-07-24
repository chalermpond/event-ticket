import { IEventRepository } from './interface/repository'
import {
    map,
    mergeMap,
    toArray,
} from 'rxjs/operators'
import {
    forkJoin,
    Observable,
} from 'rxjs'
import { EventDto } from './event.dto'
import { tap } from 'rxjs/internal/operators/tap'
import * as _ from 'lodash'
import {
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import { IEvent } from './interface/event'
import { EventValidator } from '../../controller/validator/event.validator'
import { of } from 'rxjs/internal/observable/of'
import { EventModel } from './event.model'

export class EventService {

    constructor(
        private readonly _eventRepo: IEventRepository,
    ) {
    }

    public getAllEvent(page: number, limit: number) {

        return forkJoin(
            this._eventRepo.total(),
            this._eventRepo.list(page, limit).pipe(toArray()),
        ).pipe(
            map((resp: any[]) => {
                const total = resp[0]
                const data = resp[1].map(EventDto.toEventDto)
                return {
                    page,
                    limit,
                    total,
                    data,
                }
            }),
        )
    }

    public getEventById(id: string) {
        return this._eventRepo.getById(id).pipe(
            tap((model: IEvent) => {
                if (_.isNil(model)) {
                    throw new HttpException(
                        'Event not found',
                        HttpStatus.NOT_FOUND)
                }
            }),
            map(EventDto.toEventDto),
        )
    }

    public deleteEvent(id: string) {
        return this._eventRepo.getById(id).pipe(
            tap((model: IEvent) => {
                if (_.isNil(model)) {
                    throw new HttpException(
                        'Event not found',
                        HttpStatus.NOT_FOUND)
                }
            }),
            mergeMap((model: IEvent) => {
                return this._eventRepo.delete(model)
            }),
            // TODO remove invites
        )
    }

    public createNewEvent(input: EventValidator): Observable<any> {
        return of(input).pipe(
            map(this._createModel),
            mergeMap((model: EventModel) => {
                return this._eventRepo.save(model)
            }),
        )
    }

    private _createModel(schema: EventValidator) {
        const model = new EventModel(schema.name)
        model.setEndDate(new Date(_.parseInt(schema.endDate)))
        model.setStartDate(new Date(_.parseInt(schema.startDate)))
        model.setRegisterEndDate(new Date(_.parseInt(schema.endRegister)))
        model.setRegisterStartDate(new Date(_.parseInt(schema.startRegister)))
        model.setEventTimeBegin(schema.startTime)
        model.setEventTimeEnd(schema.endTime)
        model.setMaxSeats(_.parseInt(schema.maxSeats))
        model.setSubtitle(schema.subtitle)
        model.setAddress1(schema.address1)
        model.setAddress2(schema.address2)
        model.setSecret(schema.secret)
        model.setInviteText(schema.inviteText)

        if (!_.isNil(schema.logo)) {
            model.setLogoPath(schema.logo)
        }
        if (!_.isNil(schema.banner)) {
            model.setLogoPath(schema.banner)
        }

        model.setNote(schema.note)
        model.setEnforceMax(schema.enforceMax)
        model.setAllowWalkIn(schema.allowWalkIn)
        model.setAllDay(schema.allDay)
        model.setTemplate(schema.template)
        model.setActivate(true)
        return model
    }

    public updateEvent(id: string, body: EventValidator) {
        return this._eventRepo.getById(id).pipe(
            tap((event: EventModel) => {
                if (_.isNil(event)) {
                    throw new HttpException(
                        `Cannot find event`,
                        HttpStatus.NOT_FOUND,
                    )
                }
            }),
            mergeMap((model: EventModel) => {
                const updateModel = _.assign(
                    model,
                    this._createModel(body),
                    {
                        _id: model.getId(),
                    },
                )
                return this._eventRepo.update(updateModel)
            }),
        )
    }
}
