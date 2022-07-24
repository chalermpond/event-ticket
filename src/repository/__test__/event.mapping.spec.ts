import { EventMongoRepositoryMapping } from '../event'
import { plainToClass } from 'class-transformer'
import { EventModel } from '../../domain/event/event.model'
import { RegisterTemplateName } from '../../domain/event/interface/event'

describe('EventMongoRepositoryMapping', () => {
    const mapper = new EventMongoRepositoryMapping()
    it('should success serializing data', () => {
        const model = plainToClass(EventModel, {
            _name: 'some event',
            _bannerPath: '/some/path',
            _enforceMax: true,
            _logoPath: '/some/logo/path',
            _maxSeats: 20,
            _note: null,
            _registerStart: new Date(1000),
            _registerEnd: new Date(1000),
            _startDate: new Date(1000),
            _endDate: new Date(1000),
            _template: RegisterTemplateName.Basic,
            _allDay: false,
            _allowWalkIn: false,
            _activated: false,
            _timeBegin: null,
            _timeEnd: null,
        })
        const result = mapper.serialize(model)
        expect(result.registerStart).toEqual(1000)
        expect(result.registerEnd).toEqual(1000)
        expect(result.startDate).toEqual(1000)
        expect(result.endDate).toEqual(1000)
        expect(result.template).toEqual('basic')
        expect(result.allDay).toBe(false)
        expect(result.allowWalkIn).toBe(false)
        expect(result.activated).toBe(false)
        expect(result.timeBegin).toBe('')
        expect(result.timeEnd).toBe('')
        expect(result.maxSeats).toEqual(20)
        expect(result.enforceMax).toBe(true)
        expect(result.note).toEqual('')
    })

    it('should success de-serializing data', () => {
        const schema = {
            name: 'some event',
            bannerPath: '/gg/ez',
            logoPath: '/gg/ez',
            enforceMax: true,
            maxSeats: 10,
            note: '',
            registerStart: 1000,
            registerEnd: 1000,
            startDate: 1000,
            endDate: 10000,
            template: 'basic',
            allDay: false,
            allowWalkIn: false,
            activated: true,
            timeBegin: '08:00',
            timeEnd: '17:00',
        }

        const model = mapper.deserialize(schema)
        expect(model.getRegisterStartDate()).toBeInstanceOf(Date)
        expect(model.getRegisterEndDate()).toBeInstanceOf(Date)
        expect(model.getStartDate()).toBeInstanceOf(Date)
        expect(model.getEndDate()).toBeInstanceOf(Date)
        expect(model.getTemplate()).toEqual(RegisterTemplateName.Basic)

    })
})
