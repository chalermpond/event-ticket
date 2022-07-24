import { Module } from '@nestjs/common'
import { UserModule } from './user.module'
import { RoleModule } from './role.module'
import { EventBusModule } from './event-bus.module'
import { EventModule } from './event.module'
import { InviteController } from '../controller/invite.controller'
import { ConfigModule } from './config.module'
import {
    authProviders,
    emailServiceProvider,
    handlebarServiceProvider,
    roleServiceProvider,
    userServiceProvider,
} from '../provider'
import { RegisterController } from '../controller/register.controller'
import { TicketController } from '../controller/ticket.controller'
import { StaticController } from '../controller/static.controller'
import { EventController } from '../controller/event.controller'
import { RoleController } from '../controller/role.controller'
import { UserController } from '../controller/user.controller'

@Module({
    imports: [
        UserModule,
        RoleModule,
        EventModule,
        EventBusModule,
        ConfigModule,
    ],
    controllers: [
        RegisterController,
        InviteController,
        TicketController,
        StaticController,
        EventController,
        RoleController,
        UserController,
    ],
    providers: [
        emailServiceProvider,
        handlebarServiceProvider,
        ...authProviders,
        roleServiceProvider,
        userServiceProvider,
    ],
})
export class AppModule {
}
