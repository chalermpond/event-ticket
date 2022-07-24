import { IUser } from './interface'
import { IUserDto } from './interface/user.dto'
import { isNil } from '@nestjs/common/utils/shared.utils'

export class UserDto {
    public static toUserDTO(input: IUser): IUserDto {
        if (isNil(input)) {
            return null
        }
        return {
            id: input.getUserName(),
            name: input.getName(),
            email: input.getEmail() || '',
            suspended: input.isSuspended(),
            phone: input.getPhone() || '',
        }
    }
}
