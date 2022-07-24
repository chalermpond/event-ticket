import { Module } from '@nestjs/common'
import { eventServiceProvider } from '../provider'
import { RepositoryModule } from './repository.module'
import { DatabaseModule } from './database.module'
import { EventController } from '../controller/event.controller'

@Module({
    // controllers: [EventController],
    providers: [eventServiceProvider],
    exports: [eventServiceProvider],
    imports: [
        RepositoryModule,
        DatabaseModule,
    ],
})
export class EventModule {
}
