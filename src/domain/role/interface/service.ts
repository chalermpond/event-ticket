import { IRequestValidator } from '../../../common/interface/requst-validator'
import { RoleAccessLevel } from '../../../common/role-guard'
import { Observable } from 'rxjs'

export interface IRoleService {
    createNewRole(arg: IRoleValidator): any

    updateRole(id: string, data: IRoleValidator): any

    deleteRole(id: string): any

    assignRole(id: string, users: string[]): any

    revokeRole(id: string, users: string[]): any

    list(): any

    getByUser(user: string): Observable<any>
}

export interface IRoleValidator extends IRequestValidator {
    getName(): string

    getDashboard(): RoleAccessLevel

    getEvent(): RoleAccessLevel

    getEventRegistry(): RoleAccessLevel

    getRegistrationForm(): RoleAccessLevel

    getInvitation(): RoleAccessLevel

    getTicketValidate(): RoleAccessLevel

    getDirectRegister(): RoleAccessLevel

    getSetting(): RoleAccessLevel
}
