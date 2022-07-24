import {
    Global,
    Module,
} from '@nestjs/common'
import { eventBusProvider } from '../provider'

@Global()
@Module({
    providers: [eventBusProvider],
    exports: [eventBusProvider],
    imports: [],
})
export class EventBusModule {}
