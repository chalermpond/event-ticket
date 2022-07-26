import { IAuthService } from './interface/service'
import { IConfig } from '../../common/interface/config'
import {
    Observable,
    of,
} from 'rxjs'
import { readFileSync } from 'fs'
import { ProviderName } from '../../provider'
import {
    HttpException,
    HttpStatus,
    Inject,
} from '@nestjs/common'

import {
    sign,
    verify,
    VerifyOptions,
} from 'jsonwebtoken'
import { tap } from 'rxjs/internal/operators/tap'
import { mergeMap } from 'rxjs/operators'

const {
    EnvConfigProvider,
} = ProviderName

export class AuthService implements IAuthService {
    private readonly _signAlgorithm: string = 'RS256'
    private readonly _publicKey: Buffer
    private readonly _privateKey: Buffer
    private readonly _tokenTTL: string = '365d'
    private readonly _refreshTTL: string = '365d'

    constructor(
        @Inject(EnvConfigProvider)
        private readonly _config: IConfig,
    ) {
        this._publicKey = readFileSync(this._config.auth.public)
        this._privateKey = readFileSync(this._config.auth.private)
    }

    public generateToken(payload: any): Observable<any> {
        return of({
            accessToken: this._generateAccessToken(payload),
            refreshToken: this._generateRefreshToken(payload),
        })
    }

    public _generateAccessToken(payload: any): string {
        return sign(payload,
            this._privateKey,
            {
                algorithm: this._signAlgorithm,
                expiresIn: this._tokenTTL,
            })
    }

    public _generateRefreshToken(payload: any): string {
        return sign({id: payload.id},
            this._privateKey,
            {
                algorithm: this._signAlgorithm,
                expiresIn: this._refreshTTL,
            })
    }

    public verifyToken(token: string): any {
        const verifyOpts: VerifyOptions = {
            algorithms: [this._signAlgorithm],
            ignoreExpiration: false,
        }
        try {
            return verify(token, this._publicKey, verifyOpts)
        } catch (e) {
            return false
        }

    }

    public refreshToken(token: any): Observable<any> {
        return of(this.verifyToken(token)).pipe(
            tap((result: any) => {
                console.log(result)
                if (!result) {
                    throw new HttpException(
                        'Invalid Token',
                        HttpStatus.BAD_REQUEST,
                    )
                }
            }),
            mergeMap((decoded: any) => {
                return this.generateToken(decoded)
            }),
        )
    }

}
