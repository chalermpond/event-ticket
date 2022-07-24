import { Module } from '@nestjs/common'
import { databaseProviders } from '../provider'
import { ConfigModule } from './config.module'

@Module({
    providers: [...databaseProviders],
    exports: [...databaseProviders],
    imports: [ConfigModule],
})
export class DatabaseModule {
}
