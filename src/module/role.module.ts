import { Module } from '@nestjs/common'
import { RepositoryModule } from './repository.module'
import { DatabaseModule } from './database.module'
import { roleServiceProvider } from '../provider'
import { RoleController } from '../controller/role.controller'

@Module({
    // controllers: [RoleController],
    providers: [
        roleServiceProvider,
    ],
    imports: [
        RepositoryModule,
        DatabaseModule,
    ],

})
export class RoleModule {
}
