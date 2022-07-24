import {
    get as _get,
    replace as _replace,
    findIndex as _findIndex,
} from 'lodash'
import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    SetMetadata,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { ProviderName } from '../provider'
import { IAuthService } from '../domain/auth/interface/service'
import { Reflector } from '@nestjs/core'

const {
    JwtAuthorizationProvider,
} = ProviderName

export enum SystemRole {
    ADMIN = 'admin',
    USER = 'user',
}

export enum RoleAccessLevel {
    Read = 'read',
    Full = 'full',
}
@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        @Inject(JwtAuthorizationProvider)
        private readonly _authService: IAuthService,
        private readonly _reflector: Reflector,
    ) {
    }

    public static Roles(...roles: string[]) {
        return SetMetadata('roles', roles)
    }

    public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest()
        const headers = request.headers
        const expectedRoles = this._reflector.get<string[]>('roles', context.getHandler())

        const token = _replace(
            _get(headers, 'authorization', ''),
            /^Bearer\s/ig,
            '',
        )

        try {
            const jwt = this._authService.verifyToken(token.toString())

            // TODO to be implement api role
            const roleId = _get(jwt, 'role.id', null)
           // _findIndex(expectedRoles, roleId)

            return !!jwt
        } catch (e) {
            return false
        }
    }
}
