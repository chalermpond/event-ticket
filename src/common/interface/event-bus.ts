export interface IEventBus {
    publish(eventName: string, payload: any): void
    subscribe(evenName: string, subscriber: ISubscriber): void
}

export interface ISubscriber<> {
    onEvent(payload: any): void
}
