import { Module } from '@nestjs/common'
import { RepositoryModule } from './repository.module'
import { DatabaseModule } from './database.module'
import { UserController } from '../controller/user.controller'
import { AuthModule } from './auth.module'
import {
    authServiceProvider,
    roleServiceProvider,
    userServiceProvider,
} from '../provider'

@Module({
    // controllers: [UserController],
    providers: [
        userServiceProvider,
        authServiceProvider,
        roleServiceProvider,
    ],
    imports: [
        RepositoryModule,
        DatabaseModule,
        AuthModule,
    ],

})
export class UserModule {
}
