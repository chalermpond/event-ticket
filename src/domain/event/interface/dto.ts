export interface IEventDto {
    id: string
    name: string
    logo: string
    banner: string
    hero: string
    subtitle: string
    address1: string
    address2: string
    secret: string
    eventDate: {
        startDate: number,
        endDate: number,
        beginTime: string,
        endTime: string,
    }
    registerDate: {
        startDate: number,
        endDate: number,
    }
    maxSeats: number
    note: string
    template: string
    flags: {
        enforceMax: boolean,
        allowWalkIn: boolean,
        isAllDay: boolean,
        isActivated: boolean,
    }
    inviteText: string
}
