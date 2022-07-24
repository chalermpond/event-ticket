import {
    IEventBus,
    ISubscriber,
} from './interface/event-bus'
import { from } from 'rxjs'
import { tap } from 'rxjs/internal/operators/tap'

export class EventBus implements IEventBus {
    private readonly _subscribers: Map<string, Set<ISubscriber>>

    constructor() {
        this._subscribers = new Map()
    }

    public publish(eventName: string, payload: any): void {
        const subscribers = this._subscribers.get(eventName) || new Set()
        from(subscribers).pipe(
            tap((subscriber: ISubscriber) => {
                subscriber.onEvent(payload)
            }),
        ).subscribe()
    }

    public subscribe(eventName: string, subscriber: ISubscriber): void {
        const set = this._subscribers.get(eventName) || new Set()
        set.add(subscriber)
        this._subscribers.set(eventName, set)
    }

}
