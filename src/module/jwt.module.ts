import { Module } from '@nestjs/common'
import { repositoryProviders } from '../provider'
import { DatabaseModule } from './database.module'

@Module({
    providers: [...repositoryProviders],
    exports: [...repositoryProviders],
    imports: [DatabaseModule],
})
export class RepositoryModule {
}
