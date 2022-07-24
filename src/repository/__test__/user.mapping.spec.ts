import { UserMongoRepositoryMapping } from '../user'
import { UserModel } from '../../domain/user/user.model'

describe('UserMongoRepositoryMapping', () => {

    const mapper = new UserMongoRepositoryMapping()

    it('should success serializing from model', () => {
        const model = new UserModel()
        Object.assign(model, {
            _name: 'Mr. Lorem Ipsum',
            _user: 'lorem-ipsum.dolor123',
            _salt: 'some-thing-salty',
            _email: 'email@somewhere.com',
            _suspended: false,
            _password: 'someencryptedstring',
        })

        const result = mapper.serialize(model)
        expect(result._id).toEqual('lorem-ipsum.dolor123')
        expect(result.name).toEqual('Mr. Lorem Ipsum')
        expect(result.salt).toEqual('some-thing-salty')
        expect(result.email).toEqual('email@somewhere.com')
        expect(result.status).toEqual('active')
        expect(result.secret).toEqual('someencryptedstring')
    })

    it('should success de-serializing to model', () => {
        const document = {
            _id: 'lorem-ipsum.dolor123',
            name: 'Mr. Lorem Ipsum',
            salt: 'some-thing-salty',
            email: 'email@somewhere.com',
            status: 'active',
            secret: 'someencryptedstring',
        }

        const model = mapper.deserialize(document)

        expect(model.getName()).toEqual('Mr. Lorem Ipsum')
        expect(model.getEmail()).toEqual('email@somewhere.com')
        expect(model.getUserName()).toEqual('lorem-ipsum.dolor123')

    })
})
