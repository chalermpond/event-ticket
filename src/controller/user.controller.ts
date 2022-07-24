import {
    Body,
    Controller,
    Get,
    Header,
    HttpException,
    HttpStatus,
    Inject,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common'
import {
    catchError,
    map,
} from 'rxjs/operators'
import {
    get as _get,
    replace as _replace,
} from 'lodash'
import { IUserService } from '../domain/user/interface'
import { ProviderName } from '../provider'
import { IAuthService } from '../domain/auth/interface/service'
import { UserValidator } from './validator/user.validator'
import { StringToNumberPipeTransform } from '../common/pipe-transform'
import { IUserDto } from '../domain/user/interface/user.dto'
import { IRoleService } from '../domain/role/interface/service'
import { mergeMap } from 'rxjs/internal/operators/mergeMap'
import { IRoleDto } from '../domain/role/interface/dto'
import { of } from 'rxjs/internal/observable/of'
import { RoleGuard } from '../common/role-guard'

const {
    JwtAuthorizationProvider,
    UserServiceProvider,
    RoleServiceProvider,
} = ProviderName

@Controller('/user')
export class UserController {
    constructor(
        @Inject(UserServiceProvider)
        private readonly _userService: IUserService,
        @Inject(JwtAuthorizationProvider)
        private readonly _auth: IAuthService,
        @Inject(RoleServiceProvider)
        private readonly _roleService: IRoleService,
    ) {
    }

    //
    // @UseGuards(RoleGuard)
    // @RoleGuard.Roles('admin')
    @UseGuards(RoleGuard)
    @Get('/')
    public listAllUsers(
        @Query('page', StringToNumberPipeTransform) page: number,
        @Query('limit', StringToNumberPipeTransform) limit: number,
    ) {
        return this._userService.list(page, limit)
    }

    @Get('/login')
    public login(
        @Query('user') user: string,
        @Query('password') password: string,
    ) {
        return this._userService.verifyPassword(user, password).pipe(
            mergeMap((userDto: IUserDto) => {
                return this._roleService.getByUser(user).pipe(
                    mergeMap((roleData: IRoleDto) => {
                        const result = Object.assign(
                            userDto, {
                                role: roleData,
                            },
                        )
                        return of(result)
                    }),
                    catchError(() => {
                        const result = Object.assign(
                            userDto, {
                                role: null,
                            },
                        )
                        return of(result)
                    }),
                )
            }),
            map((mergedData: any) => {
                return this._auth.generateToken(mergedData)
            }),
        )
    }

    @Get('/token/refresh')
    public refreshToken(
        @Req() req: any,
    ) {
        const token = _get(req, 'headers.authorization', false)
        if (!token) {
            throw new HttpException(
                `Invalid Header`,
                HttpStatus.BAD_REQUEST,
            )
        }
        const result = this._auth.verifyToken(_replace(token, 'Bearer ', ''))
        if (!result) {
            throw new HttpException(
                `Invalid Authorization`,
                HttpStatus.BAD_REQUEST,
            )
        }
        return this._userService.getUser(result.id).pipe(
            mergeMap((userDto: IUserDto) => {
                return this._auth.generateToken(userDto)
            }),
        )
    }

    @UseGuards(RoleGuard)
    @Get('/:id')
    public getUserById(
        @Param('id') id: string,
    ) {
        return this._userService.getUser(id)
    }

    @UseGuards(RoleGuard)
    @Post('/')
    public createNewUser(
        @Body() body: UserValidator,
    ) {
        return this._userService.create(body).pipe(
            map((resp: any) => ({id: resp.id})),
        )
    }

    @UseGuards(RoleGuard)
    @Patch('/:id/suspend')
    public suspendUser(
        @Param('id') id: string,
    ) {
        return this._userService.suspend(id)
    }

    @UseGuards(RoleGuard)
    @Patch('/:id/reactivate')
    public reactivateUser(
        @Param('id') id: string,
    ) {
        return this._userService.reactivate(id)
    }

    @UseGuards(RoleGuard)
    @Put('/:id')
    public updateUser(
        @Param('id') id: string,
        @Body() payload: UserValidator,
    ) {
        return this._userService.update(id, payload)
    }

}
