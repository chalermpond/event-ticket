import * as _ from 'lodash'
import { UserModel } from './user.model'
import {
    IUser,
    IUserValidator,
} from './interface'
import { SystemRole } from '../../common/role-guard'

export class UserMapping {
    public static requestToUserModelMapping(input: IUserValidator, target?: IUser): IUser {
        let user: any
        if (_.isNil(target)) {
            user = new UserModel()
        } else {
            user = target
        }

        if (!_.isNil(input.getId())) {
            user._user = input.getId()
        }
        if (!_.isNil(input.getName())) {
            user._name = input.getName()
        }
        if (!_.isNil(input.getEmail())) {
            user._email = input.getEmail()
        }
        if (!_.isNil(input.getPhone())) {
            user._phone = input.getPhone()
        }
        if (!_.isNil(input.getSuspended())) {
            user._suspended = input.getSuspended()
        }
        if (_.isNil(user.getRole())) {
            user._role = SystemRole.USER
        }
        if (!_.isNil(input.getPassword())) {
            user.setPassword(input.getPassword())
        }

        return user
    }
}
