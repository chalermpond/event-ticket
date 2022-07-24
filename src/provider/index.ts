export enum ProviderName {
    JwtAuthorizationProvider = 'jwt-authorization',
    EnvConfigProvider = 'environment-config',
    MongoDBConnectionProvider = 'mongodb-connection',
    EventBusProvider = 'event-bus',
    EventServiceProvider = 'event-service',

    EventRepositoryProvider = 'event-repository',
    UserRepositoryProvider = 'user-repository',
    RoleRepositoryProvider = 'role-repository',

    UserServiceProvider = 'user-service',
    RoleServiceProvider = 'role-service',
    EmailServiceProvider = 'email-service',

    HandleBarServiceProvider = 'handlebar-service',
}

export * from './env-config'
export * from './database'
export * from './repository'
export * from './auth'
export * from './service'
export * from './event-bus'
