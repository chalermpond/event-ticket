import * as _ from 'lodash'
import * as Moment from 'moment'
import { Entity } from '../../common/entity'
import {
    IEvent,
    RegisterTemplateName,
} from './interface/event'

export class EventModel extends Entity implements IEvent {

    private _name: string
    private _subtitle: string
    private _address1: string
    private _address2: string
    private _hero: string
    private _bannerPath: string
    private _endDate: Date
    private _enforceMax: boolean
    private _logoPath: string
    private _maxSeats: number
    private _note: string
    private _registerEnd: Date
    private _registerStart: Date
    private _startDate: Date
    private _template: RegisterTemplateName
    private _allDay: boolean
    private _allowWalkIn: boolean
    private _activated: boolean
    private _timeBegin: string
    private _timeEnd: string
    private _secret: string
    private _inviteText: string
    private _docPath: string

    constructor(eventName: string) {
        super()
        this._name = eventName
        this._enforceMax = false
        this._activated = false
        this._template = RegisterTemplateName.Basic
        this._allDay = true
        this._allowWalkIn = false
    }

    public getSubtitle(): string {
        return this._subtitle
    }

    public getSecret(): string {
        return this._secret
    }

    public setSecret(secret: string) {
        this._secret = secret
    }

    public getAddress1(): string {
        return this._address1
    }

    public getAddress2(): string {
        return this._address2
    }

    public setSubtitle(subtitle: string): void {
        this._subtitle = subtitle
    }

    public setAddress1(address: string): void {
        this._address1 = address
    }

    public setAddress2(address: string): void {
        this._address2 = address
    }

    public getName(): string {
        return this._name
    }

    public getBannerPath(): string {
        return this._bannerPath
    }

    public getEndDate(): Date {
        return this._endDate
    }

    public getEnforceMax(): boolean {
        return this._enforceMax
    }

    public getLogoPath(): string {
        return this._logoPath
    }

    public getMaxSeats(): number {
        return this._maxSeats
    }

    public getNote(): string {
        return this._note
    }

    public getRegisterEndDate(): Date {
        return this._registerEnd
    }

    public getRegisterStartDate(): Date {
        return this._registerStart
    }

    public getStartDate(): Date {
        return this._startDate
    }

    public getTemplate(): RegisterTemplateName {
        return this._template
    }

    public isAllDay(): boolean {
        return this._allDay
    }

    public isAllowWalkIn(): boolean {
        return this._allowWalkIn
    }

    public setAllDay(allDay: boolean): void {
        this._allDay = allDay
    }

    public setAllowWalkIn(walkIn: boolean): void {
        this._allowWalkIn = walkIn
    }

    public setBannerPath(path: string): void {
        this._bannerPath = path
    }

    public setEndDate(date: Date): void {
        if (!_.isNil(this._startDate)) {
            this.assertTrue(
                Moment(date).isSameOrAfter(this._startDate),
                'end date must equal or after start date',
            )
        }

        this._endDate = date
    }

    public setEnforceMax(enforce: boolean): void {
        this._enforceMax = enforce
    }

    public setLogoPath(path: string): void {
        this._logoPath = path
    }

    public setMaxSeats(max: number): void {
        this.assertTrue(
            max >= 0,
            'Max seat must be a positive-not-zero',
        )
        this._maxSeats = max
    }

    public setName(name: string): void {
        this._name = name
    }

    public setRegisterEndDate(date: Date): void {
        if (!_.isNil(this._endDate)) {
            this.assertTrue(
                Moment(date).isSameOrBefore(this._endDate),
                'Register end date must lesser or equal event end date',
            )
        }

        if (!_.isNil(this._registerStart)) {
            this.assertTrue(
                Moment(date).isSameOrAfter(this._registerStart),
                'Register end date must greater or equal register start date',
            )
        }

        this._registerEnd = date
    }

    public setRegisterStartDate(date: Date): void {
        if (!_.isNil(this._registerEnd)) {
            this.assertTrue(
                Moment(date).isSameOrBefore(this._registerEnd),
                `Register start date should lesser or equal register end date`,
            )
        }

        if (!_.isNil(this._startDate)) {
            this.assertTrue(
                Moment(date).isSameOrBefore(this._startDate),
                `Register start date should lesser or equal start date`,
            )
        }

        if (!_.isNil(this._endDate)) {
            this.assertTrue(
                Moment(date).isSameOrBefore(this._endDate),
                `Register start date should lesser or equal event end date`,
            )
        }

        this._registerStart = date
    }

    public setStartDate(date: Date): void {
        if (!_.isNil(this._endDate)) {
            this.assertTrue(
                Moment(date).isSameOrBefore(this._endDate),
                'Start Date must lesser or equal End Date',
            )

        }

        this._startDate = date
    }

    public setTemplate(template: RegisterTemplateName): void {
        this._template = template
    }

    public isActivated(): boolean {
        return this._activated
    }

    public setActivate(activate: boolean): void {
        this.assertTrue(
            !_.isNil(this._maxSeats) &&
            !_.isNil(this._startDate) &&
            !_.isNil(this._endDate) &&
            !_.isNil(this._registerStart) &&
            !_.isNil(this._registerEnd),
            'Cannot activate in-completed event setting',
        )
        this._activated = activate
    }

    public getEventTimeBegin(): string {
        return this._timeBegin
    }

    public getEventTimeEnd(): string {
        return this._timeEnd
    }

    public setEventTimeBegin(begin: string): void {
        this._timeBegin = begin
    }

    public setEventTimeEnd(end: string): void {
        this._timeEnd = end
    }

    public setNote(note: string) {
        this._note = note
    }

    public setHero(hero: string) {
        this._hero = hero
    }

    public getHero(): string {
        return this._hero
    }

    public getInviteText(): string {
        return this._inviteText
    }

    public setInviteText(text: string): void {
        this._inviteText = text
    }

    public getDocPath(): string {
        return this._docPath
    }
}
