import { Module } from '@nestjs/common'
import { AuthService } from '../domain/auth/auth.service'
import { ConfigModule } from './config.module'

@Module({
    providers: [AuthService],
    exports: [AuthService],
    imports: [ConfigModule],
})
export class AuthModule {
}
