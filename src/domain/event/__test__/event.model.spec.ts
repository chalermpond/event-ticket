import { EventModel } from '../event.model'
import { plainToClass } from 'class-transformer'

describe('Event Model', () => {

    let mockModel: EventModel = null
    beforeEach(() => {

        // reset mock model every test
        mockModel = plainToClass(EventModel, {
            _startDate: new Date(1000),
            _endDate: new Date(1000),
            _registerStart: new Date(1000),
            _registerEnd: new Date(1000),
        })
    })

    it('should handle start date correctly', () => {
        mockModel.setStartDate(new Date(999))
        expect(mockModel.getStartDate().getTime()).toEqual(999)
    })

    it('should not allow cross date on start date', () => {
        expect(() => {
            mockModel.setStartDate(new Date(1001))
        }).toThrow()
    })

    it('should handle end date correctly', () => {
        mockModel.setStartDate(new Date(999))
        expect(mockModel.getStartDate().getTime()).toEqual(999)

    })

    it('should not allow cross date on end date', () => {
        expect(() => {
            mockModel.setEndDate(new Date(999))
        }).toThrow()
    })

    it('should handle start register date correctly', () => {
        mockModel.setRegisterStartDate(new Date(999))
        expect(mockModel.getRegisterStartDate().getTime()).toEqual(999)

    })

    it('should not allow cross date on start register', () => {
        expect(() => {
            mockModel.setRegisterStartDate(new Date(1001))
        }).toThrow()
    })

    it('should not allow start register after event started', () => {
        mockModel.setEndDate(new Date(3000)) // expand end date
        mockModel.setStartDate(new Date(2000))

        expect(() => {
            mockModel.setRegisterStartDate(new Date(2500))
        }).toThrow()
    })

    it('should not allow to set register end date after event end', () => {
        mockModel.setEndDate(new Date(3000))
        expect(() => {
            mockModel.setRegisterEndDate(new Date(4000))
        }).toThrow()
    })

    it('should handle end register date correctly', () => {
        mockModel = plainToClass(EventModel, {
            _startDate: new Date(1000),
            _endDate: new Date(2000),
            _registerStart: new Date(1000),
            _registerEnd: new Date(1000),
        })
        mockModel.setRegisterEndDate(new Date(1001))
        expect(mockModel.getRegisterEndDate().getTime()).toEqual(1001)

    })

    it('should not allow cross date on end register', () => {
        expect(() => {
            mockModel.setRegisterEndDate(new Date(999))
        }).toThrow()
    })

    it('should check activate event correctly', () => {
        expect(() => {
            mockModel = new EventModel('event name')

            mockModel.setMaxSeats(10)
            mockModel.setRegisterStartDate(new Date(1000))
            mockModel.setRegisterEndDate(new Date(2000))
            mockModel.setStartDate(new Date(1500))
            mockModel.setEndDate(new Date(3000))

            mockModel.setActivate(true)
        }).not.toThrow()
    })

    it('should unable to activate event if event not complete setup', () => {
        mockModel = new EventModel('event name')
        expect(() => {
            mockModel.setActivate(true)
        }).toThrow()

        mockModel.setStartDate(new Date(1500))
        expect(() => {
            mockModel.setActivate(true)
        }).toThrow()

        mockModel.setEndDate(new Date(3000))
        expect(() => {
            mockModel.setActivate(true)
        }).toThrow()

        mockModel.setRegisterStartDate(new Date(1000))
        expect(() => {
            mockModel.setActivate(true)
        }).toThrow()

        mockModel.setRegisterEndDate(new Date(2000))
        expect(() => {
            mockModel.setActivate(true)
        }).toThrow()

        mockModel.setMaxSeats(10)
        expect(() => {
            mockModel.setActivate(true)
        }).not.toThrow()

    })

    it('should not allow negative or zero max seat', () => {
        expect(() => {
            mockModel.setMaxSeats(0)
            mockModel.setMaxSeats(-1)
        }).toThrow()
    })
})
