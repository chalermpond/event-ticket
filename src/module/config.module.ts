import {
    Global,
    Module,
} from '@nestjs/common'
import { environmentConfig } from '../provider'

@Global()
@Module({
    providers: [environmentConfig],
    exports: [environmentConfig],
})
export class ConfigModule {
}
