import { UserMapping } from '../user.mapping'
import { IUserValidator } from '../interface'
import { UserValidator } from '../../../controller/validator/user.validator'

describe('UserMapping', () => {
    it(`should success mapping from Request input into new model`, () => {
        const mockInput: IUserValidator = new UserValidator()
        Object.assign(mockInput, {
            id: 'aZ09.-',
            name: 'Someone',
            email: 'hereis@my.email',
            password: 'someplaintextpassword',
        })

        const result: any = UserMapping.requestToUserModelMapping(mockInput)
        expect(result.getName()).toEqual('Someone')
        expect(result.getUserName()).toEqual('aZ09.-')
        expect(result.getEmail()).toEqual('hereis@my.email')
        expect(result._password).not.toEqual('someplaintextpassword')
        expect(result._salt).not.toBeNull()
        expect(result._suspended).toEqual(false)
        expect(result._role).toEqual('user')
    })
})
