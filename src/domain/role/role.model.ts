import {
    IRole,
    ModuleName,
    RoleAccessibility,
} from './interface/role'
import { Entity } from '../../common/entity'

export class RoleModel extends Entity implements IRole {
    private _name: string
    private readonly _accessMap: Map<ModuleName, RoleAccessibility>
    private readonly _users: Set<string>

    constructor() {
        super()
        this._accessMap = new Map()
        this._users = new Set<string>()
    }

    getModuleAccessibility(module: ModuleName): RoleAccessibility {
        return this._accessMap.get(module)
    }

    getName(): string {
        return this._name
    }

    setModuleAccessibility(module: ModuleName, accessibility: RoleAccessibility): void {
        this._accessMap.set(module, accessibility)
    }

    setName(name: string): void {
        this._name = name
    }

    public getUsers(): string[] {
        return Array.from(this._users)
    }

    public addUser(userId: string): void {
        if (!this._users.has(userId)) {
            this._users.add(userId)
        }
    }

    public removeUser(userId: string): void {
        if (this._users.has(userId)) {
            this._users.delete(userId)
        }

    }

}
