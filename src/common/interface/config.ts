export interface IConfig {
    application: {
        port: number,
    }
    mongodb: IMongoDB,
    auth: IAuth,
    email: {
        user: string,
        pass: string,
        host: string
        port: number,
        secure: boolean,
    },
    links: {
        registerDomain: string,
    }
}

export interface IMongoDB {
    servers: string
    port: number
    dbName: string
    username?: string
    password?: string
    authSource?: string
}

export interface IAuth {
    public: string
    private: string
}
