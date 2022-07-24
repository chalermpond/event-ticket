import { RoleMongoRepositoryMapping } from '../role'
import { RoleModel } from '../../domain/role/role.model'
import { plainToClass } from 'class-transformer'
import {
    ModuleName,
    RoleAccessibility,
} from '../../domain/role/interface/role'

describe('RoleMongoRepositoryMapping', () => {
    const mapper = new RoleMongoRepositoryMapping()
    it('should success serializing data', () => {
        const obj = {
            _id: 'hello',
            _name: 'hello',
            _users: new Set(['1', '2', '3']),
            _accessMap: new Map([
                [ModuleName.Dashboard, RoleAccessibility.ViewOnly],
                [ModuleName.Event, RoleAccessibility.FullAccess],
            ]),
        }
        const model = plainToClass(RoleModel, obj)
        const result = mapper.serialize(model)
        expect(result._id).toEqual('hello')
        expect(result.name).toEqual('hello')
        expect(result).toHaveProperty('users')
        expect(result.users).toContain('3')
        expect(result.users).toContain('2')
        expect(result.users).toContain('1')
        expect(result).toHaveProperty('access')
        expect(result.access).toHaveProperty('dashboard')
        expect(result.access).toHaveProperty('event')
    })

    it('should success de-serializing data', () => {
        const obj = {
            _id: 'hello',
            name: 'hello',
            users: ['1', '2', '3'],
            access: {
                dashboard: 'view-only',
                event: 'full-access',
            },
        }

        const model = mapper.deserialize(obj)
        expect(model).toBeInstanceOf(RoleModel)
        expect(model.getName()).toEqual('hello')
        expect(model.getModuleAccessibility(ModuleName.Invitation)).toBeUndefined()
        expect(model.getModuleAccessibility(ModuleName.Dashboard)).toStrictEqual(RoleAccessibility.ViewOnly)
        expect(model.getModuleAccessibility(ModuleName.Event)).toStrictEqual(RoleAccessibility.FullAccess)
        expect(model.getUsers()).toHaveLength(3)
        expect(model.getUsers()).toEqual(['1', '2', '3'])

    })

})
