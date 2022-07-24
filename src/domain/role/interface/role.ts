import { IEntity } from '../../../common/interface/entity'

export enum RoleAccessibility {
    FullAccess = 'full-access',
    ViewOnly = 'view-only',
}

export enum ModuleName {
    Dashboard = 'dashboard',
    Event = 'event',
    EventRegistry = 'event-registry',
    RegistrationForm = 'registration-form',
    Invitation = 'invitation',
    TicketValidate = 'ticket-validate',
    DirectRegister = 'direct-register',
    Setting = 'setting',
}
export interface IRole extends IEntity {
    getName(): string
    setName(name: string): void
    setModuleAccessibility(module: ModuleName, accessibility: RoleAccessibility): void
    getModuleAccessibility(module: ModuleName): RoleAccessibility
    getUsers(): string[]
    addUser(userId: string): void
    removeUser(userId: string): void
}
