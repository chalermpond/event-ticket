import { ProviderName } from './index'
import { Db } from 'mongodb'
import {
    EventMongoRepository,
    RoleMongoRepository,
    UserMongoRepository,
} from '../repository/'

import { Provider as NestProviderInterface } from '@nestjs/common/interfaces'

const {
    MongoDBConnectionProvider,
    EventRepositoryProvider,
    UserRepositoryProvider,
    RoleRepositoryProvider,
} = ProviderName

export const repositoryProviders: NestProviderInterface[] = [
    {
        provide: EventRepositoryProvider,
        useFactory: (db: Db) => {
            return new EventMongoRepository(db)
        },
        inject: [MongoDBConnectionProvider],
    },
    {
        provide: UserRepositoryProvider,
        useFactory: (db: Db) => {
            return new UserMongoRepository(db)
        },
        inject: [MongoDBConnectionProvider],
    },
    {
        provide: RoleRepositoryProvider,
        useFactory: (db: Db) => {
            return new RoleMongoRepository(db)
        },
        inject: [MongoDBConnectionProvider],
    },
]
