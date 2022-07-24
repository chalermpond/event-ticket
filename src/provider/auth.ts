import { Provider as NestProviderInterface } from '@nestjs/common'
import { ProviderName } from './index'
import { AuthService } from '../domain/auth/auth.service'
import { IConfig } from '../common/interface/config'

const {
    JwtAuthorizationProvider,
    EnvConfigProvider,
} = ProviderName

export const authProviders: NestProviderInterface[] = [
    {
        provide: JwtAuthorizationProvider,
        inject: [
            EnvConfigProvider,
        ],
        useFactory: (config: IConfig) => new AuthService(config),
    },
]
