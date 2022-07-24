import { IEntity } from '../../../common/interface/entity'

export enum RegisterTemplateName {
    Basic = 'basic',
    Swimlane = 'swimlane',
}

export interface IEvent extends IEntity {
    getName(): string

    getHero(): string

    setHero(hero: string): void

    getSecret(): string

    setSecret(secret: string): void

    getSubtitle(): string

    getAddress1(): string

    getAddress2(): string

    setSubtitle(subtitle: string): void

    setAddress1(address: string): void

    setAddress2(address: string): void

    getLogoPath(): string

    getBannerPath(): string

    getStartDate(): Date

    getEndDate(): Date

    getEventTimeBegin(): string

    getEventTimeEnd(): string

    setEventTimeBegin(begin: string): void

    setEventTimeEnd(end: string): void

    isAllDay(): boolean

    getMaxSeats(): number

    getEnforceMax(): boolean

    isAllowWalkIn(): boolean

    isActivated(): boolean

    getRegisterStartDate(): Date

    getRegisterEndDate(): Date

    getNote(): string

    getTemplate(): RegisterTemplateName

    setName(name: string): void

    setLogoPath(path: string): void

    setBannerPath(path: string): void

    setStartDate(date: Date): void

    setEndDate(date: Date): void

    setAllDay(allDay: boolean): void

    setMaxSeats(max: number): void

    setEnforceMax(enforce: boolean): void

    setAllowWalkIn(walkIn: boolean): void

    setRegisterStartDate(date: Date): void

    setRegisterEndDate(date: Date): void

    setTemplate(template: RegisterTemplateName): void

    setActivate(activate: boolean): void

    setNote(note: string)

    getInviteText(): string

    setInviteText(text: string): void

    getDocPath(): string

}
