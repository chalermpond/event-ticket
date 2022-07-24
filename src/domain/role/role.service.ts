import {
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import {
    first,
    map,
    mergeMap,
    tap,
    toArray,
} from 'rxjs/operators'
import * as _ from 'lodash'

import {
    IRoleService,
    IRoleValidator,
} from './interface/service'
import { IRoleRepository } from './interface/repository'
import {
    IRole,
    ModuleName,
    RoleAccessibility,
} from './interface/role'
import { RoleModel } from './role.model'
import { RoleAccessLevel } from '../../common/role-guard'
import { toRoleDTO } from './role.dto'
import { IEventBus } from '../../common/interface/event-bus'
import { Observable } from 'rxjs'
import { IRoleDto } from './interface/dto'

export class RoleService implements IRoleService {
    constructor(
        private readonly _eventBus: IEventBus,
        private readonly _roleRepo: IRoleRepository,
    ) {
    }

    public static setRoleAccessibility(roleModel: IRole, arg: IRoleValidator): IRole {

        if (!_.isNil(arg.getDashboard())) {
            roleModel.setModuleAccessibility(
                ModuleName.Dashboard,
                arg.getDashboard() === RoleAccessLevel.Full
                    ? RoleAccessibility.FullAccess
                    : RoleAccessibility.ViewOnly)
        }
        if (!_.isNil(arg.getEvent())) {
            roleModel.setModuleAccessibility(
                ModuleName.Event,
                arg.getEvent() === RoleAccessLevel.Full
                    ? RoleAccessibility.FullAccess
                    : RoleAccessibility.ViewOnly)
        }
        if (!_.isNil(arg.getEventRegistry())) {
            roleModel.setModuleAccessibility(
                ModuleName.EventRegistry,
                arg.getEventRegistry() === RoleAccessLevel.Full
                    ? RoleAccessibility.FullAccess
                    : RoleAccessibility.ViewOnly)
        }
        if (!_.isNil(arg.getRegistrationForm())) {
            roleModel.setModuleAccessibility(
                ModuleName.RegistrationForm,
                arg.getRegistrationForm() === RoleAccessLevel.Full
                    ? RoleAccessibility.FullAccess
                    : RoleAccessibility.ViewOnly)
        }
        if (!_.isNil(arg.getInvitation())) {
            roleModel.setModuleAccessibility(
                ModuleName.Invitation,
                arg.getInvitation() === RoleAccessLevel.Full
                    ? RoleAccessibility.FullAccess
                    : RoleAccessibility.ViewOnly)
        }
        if (!_.isNil(arg.getTicketValidate())) {
            roleModel.setModuleAccessibility(
                ModuleName.TicketValidate,
                arg.getTicketValidate() === RoleAccessLevel.Full
                    ? RoleAccessibility.FullAccess
                    : RoleAccessibility.ViewOnly)
        }
        if (!_.isNil(arg.getDirectRegister())) {
            roleModel.setModuleAccessibility(
                ModuleName.DirectRegister,
                arg.getDirectRegister() === RoleAccessLevel.Full
                    ? RoleAccessibility.FullAccess
                    : RoleAccessibility.ViewOnly)
        }
        if (!_.isNil(arg.getSetting())) {
            roleModel.setModuleAccessibility(
                ModuleName.Setting,
                arg.getSetting() === RoleAccessLevel.Full
                    ? RoleAccessibility.FullAccess
                    : RoleAccessibility.ViewOnly)
        }
        return roleModel
    }

    public assignRole(id: string, data: string[]): any {
        // TODO check user getId from user repo
        return this._roleRepo.getByID(id).pipe(
            map((role: IRole) => {
                data.forEach((user: string) => {
                    role.addUser(user)
                })
                return role
            }),
            mergeMap((role: IRole) => {
                return this._roleRepo.update(role)
            }),
        )
    }

    public createNewRole(arg: IRoleValidator): any {

        const constructNewModel = () => {
            const roleModel = new RoleModel()
            roleModel.setId(arg.getId())
            roleModel.setName(arg.getName())
            return RoleService.setRoleAccessibility(roleModel, arg)
        }

        return this._roleRepo.getByID(arg.getId()).pipe(
            tap((role: IRole) => {
                if (!_.isNil(role)) {
                    throw new HttpException(
                        'Role existed',
                        HttpStatus.FORBIDDEN)
                }
            }),
            map(constructNewModel),
            mergeMap((model: IRole) => {
                return this._roleRepo.save(model)
            }),
        )
    }

    public deleteRole(id: string): any {
        return this._roleRepo.getByID(id).pipe(
            tap((role: IRole) => {
                if (_.isNil(role)) {
                    throw new HttpException(
                        `Role not found`,
                        HttpStatus.BAD_REQUEST,
                    )
                }
            }),
            tap((role: IRole) => {
                const users = role.getUsers()
                if (!_.isEmpty(users)) {
                    throw new HttpException(
                        'Cannot remove assigned role',
                        HttpStatus.FORBIDDEN,
                    )
                }
            }),
            mergeMap((role: IRole) => {
                return this._roleRepo.delete(role).pipe(
                    map(() => {
                        return toRoleDTO(role)
                    }),
                )
            }),
        )
    }

    // TODO implement pagination
    public list(): any {
        return this._roleRepo.list(1, 20).pipe(
            map(toRoleDTO),
            toArray(),
        )
    }

    public updateRole(id: string, data: IRoleValidator): any {
        return this._roleRepo.getByID(id).pipe(
            tap((role: IRole) => {
                if (_.isNil(role)) {
                    throw new HttpException(
                        `Role not found`,
                        HttpStatus.BAD_REQUEST,
                    )
                }
            }),
            map((role: IRole) => {
                if (!_.isNil(data.getName())) {
                    role.setName(data.getName())
                }
                return RoleService.setRoleAccessibility(role, data)
            }),
            mergeMap((role: IRole) => {
                role.setId(id) // ignore id payload change
                return this._roleRepo.update(role)
            }),
        )
    }

    public revokeRole(id: string, users: string[]): any {
        // TODO check user id from user repo
        return this._roleRepo.getByID(id).pipe(
            map((role: IRole) => {
                users.forEach((user: string) => {
                    role.removeUser(user)
                })
                return role
            }),
            mergeMap((role: IRole) => {
                return this._roleRepo.update(role)
            }),
        )
    }

    public getByUser(user: string): Observable<IRoleDto> {
        return this._roleRepo.list(0, 0).pipe(
            first((role: IRole) => {
                const users: string[] = role.getUsers()
                const filterResult = _.filter(users, (roleUser: string) => {
                    return roleUser === user
                })
                return filterResult.length > 0
            }),
            map((role: IRole) => toRoleDTO(role)),
        )
    }

}
