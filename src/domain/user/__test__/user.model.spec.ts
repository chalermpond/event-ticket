import { UserModel } from '../user.model'
import { SystemRole } from '../../../common/role-guard'

describe('User Model', () => {
    it(`cannot leverage into admin`, () => {
        const user = new UserModel()
        Object.assign(user, { _role: SystemRole.USER})

        expect( () => {
            user.setRole(SystemRole.ADMIN)
        }).toThrow()
    })

    it(`cannot revoke admin role`, () => {
        const user = new UserModel()
        Object.assign(user, {  _role: SystemRole.ADMIN})

        expect( () => {
            user.setRole(SystemRole.USER)
        }).toThrow()
    })

    it(`should encrypt difference password on same token`, () => {
        const user1 = new UserModel()
        const password1 = user1.setPassword('token')

        const user2 = new UserModel()
        const password2 = user2.setPassword('token')
        expect(password1).not.toEqual(password2)
    })

    it('success challenging password', () => {
        const user = new UserModel()
        user.setPassword('token')

        expect( user.challengePassword('token'))
            .toStrictEqual(true)
    })
})
