import { Provider as NestProviderInterface } from '@nestjs/common'
import { ProviderName } from './index'
import { EventBus } from '../common/event-bus'

export const eventBusProvider: NestProviderInterface = {
    provide: ProviderName.EventBusProvider,
    useFactory: () => {
        return new EventBus()
    },
}
