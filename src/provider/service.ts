import { ProviderName } from './index'
import { UserService } from '../domain/user/user.service'
import { IUserRepository } from '../domain/user/interface/repository'
import { Provider as NestProviderInterface } from '@nestjs/common'
import { AuthService } from '../domain/auth/auth.service'
import { IConfig } from '../common/interface/config'
import { IAuthService } from '../domain/auth/interface/service'
import { IUserService } from '../domain/user/interface'
import { IRoleRepository } from '../domain/role/interface/repository'
import { RoleService } from '../domain/role/role.service'
import { IEventBus } from '../common/interface/event-bus'
import { IEventRepository } from '../domain/event/interface/repository'
import { EventService } from '../domain/event/event.service'
import { EmailProvider } from '../common/email-provider'
import { HandleBarService } from '../common/handle-bar-service'

const {
    EnvConfigProvider,
    HandleBarServiceProvider,
} = ProviderName

export const userServiceProvider: NestProviderInterface = {
    provide: ProviderName.UserServiceProvider,
    inject: [
        ProviderName.EventBusProvider,
        ProviderName.UserRepositoryProvider,
    ],
    useFactory: (
        eventBus: IEventBus,
        userRepository: IUserRepository,
    ): IUserService => {
        return new UserService(
            eventBus,
            userRepository,
        )

    },
}

export const authServiceProvider: NestProviderInterface = {
    provide: ProviderName.JwtAuthorizationProvider,
    inject: [ProviderName.EnvConfigProvider],
    useFactory: (config: IConfig): IAuthService => {
        return new AuthService(config)
    },
}

export const roleServiceProvider: NestProviderInterface = {
    provide: ProviderName.RoleServiceProvider,
    inject: [
        ProviderName.EventBusProvider,
        ProviderName.RoleRepositoryProvider,
    ],
    useFactory: (
        eventBus: IEventBus,
        roleRepository: IRoleRepository,
    ) => {
        return new RoleService(
            eventBus,
            roleRepository,
        )
    },
}

export const eventServiceProvider: NestProviderInterface = {
    provide: ProviderName.EventServiceProvider,
    inject: [
        ProviderName.EventRepositoryProvider,
    ],
    useFactory: (
        eventRepository: IEventRepository,
    ) => {
        return new EventService(
            eventRepository,
        )
    },
}

export const emailServiceProvider: NestProviderInterface = {
    provide: ProviderName.EmailServiceProvider,
    useFactory: (config: IConfig) => {
        return new EmailProvider(config)
    },
    inject: [
        EnvConfigProvider,
    ],
}

export const handlebarServiceProvider: NestProviderInterface = {
    provide: ProviderName.HandleBarServiceProvider,
    useFactory: () => {
        return new HandleBarService()
    },
    inject: [
    ],
}
