import { tap } from 'rxjs/internal/operators/tap'
import * as _ from 'lodash'
import {
    IUser,
    IUserService,
    IUserValidator,
} from './interface'
import {
    forkJoin,
    Observable,
} from 'rxjs'
import { IUserRepository } from './interface/repository'
import { IEventBus } from '../../common/interface/event-bus'
import {
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import {
    filter,
    map,
    mergeMap,
    toArray,
} from 'rxjs/operators'
import { UserMapping } from './user.mapping'
import { UserDto } from './user.dto'
import { IUserDto } from './interface/user.dto'

export class UserService implements IUserService {
    constructor(
        private readonly _eventBus: IEventBus,
        private readonly _userRepository: IUserRepository,
    ) {
    }

    /**
     * Create new user from input
     * @param input IUserValidator
     */
    public create(input: IUserValidator): Observable<any> {
        return this._userRepository.getById(input.getId()).pipe(
            tap((user: IUser) => {
                if (!_.isNil(user)) {
                    throw new HttpException(
                        'User existed',
                        HttpStatus.FORBIDDEN)
                }
            }),
            map(() => UserMapping.requestToUserModelMapping(input)),
            mergeMap((user: IUser) => this._userRepository.save(user)),
        )
    }

    public suspend(id: string): Observable<any> {
        return this._checkIfUserFound(id).pipe(
            mergeMap((user: IUser) => {
                user.setSuspend(true)
                return this._userRepository.update(user)
            }),
        )
    }

    public reactivate(id: string): Observable<any> {
        return this._checkIfUserFound(id).pipe(
            mergeMap((user: IUser) => {
                user.setSuspend(false)
                return this._userRepository.update(user)
            }),
        )
    }

    public update(id: string, input: IUserValidator): Observable<any> {
        if (id !== input.getId()) {
            throw new HttpException(
                `Username change not allowed`,
                HttpStatus.BAD_REQUEST,
            )
        }
        return this._checkIfUserFound(id).pipe(
            map((user: IUser) => UserMapping.requestToUserModelMapping(input, user)),
            mergeMap((user: IUser) => this._userRepository.update(user)),
            map((resp: any) => ({id: resp.id})),
        )
    }

    public verifyPassword(username: string, password: string): Observable<IUserDto> {
        return this._checkIfUserFound(username).pipe(
            filter((user: IUser) => !user.isSuspended()),
            map((user: IUser) => {
                const isSuccess = user.challengePassword(password)
                if (isSuccess) {
                    return UserDto.toUserDTO(user)
                }
                throw new HttpException(
                    `Verify failed`,
                    HttpStatus.UNAUTHORIZED,
                )
            }),
        )
    }

    /**
     * Get single user information
     * @param id
     */
    public getUser(id: string): Observable<any> {
        return this._checkIfUserFound(id).pipe(
            filter((user: IUser) => !user.isSuspended()),
            tap((user: IUser) => {
                if (_.isNil(user)) {
                    throw new HttpException(
                        'User not found',
                        HttpStatus.NOT_FOUND)
                }
            }),
            map(UserDto.toUserDTO),
        )
    }

    /**
     * list users
     * @param page
     * @param limit
     */
    public list(page: number, limit: number): Observable<any> {
        return forkJoin(
            this._userRepository.total(),
            this._userRepository.list(page, limit).pipe(toArray()),
        ).pipe(
            map((resp: any[]) => {
                const total = resp[0]
                const data = resp[1].map(UserDto.toUserDTO)
                return {
                    page,
                    limit,
                    total,
                    data,
                }
            }),
        )
    }

    private _checkIfUserFound(userId: string): Observable<IUser> {
        return this._userRepository.getById(userId).pipe(
            tap((user: IUser) => {
                if (_.isNil(user)) {
                    throw new HttpException(
                        'User not found',
                        HttpStatus.NOT_FOUND)
                }
            }),
        )
    }

}
