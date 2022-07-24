import {
    IsDefined,
    IsEnum,
    IsIn,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator'

import {
    isEmpty,
    replace,
    toLower,
    trim,
} from 'lodash'
import { RoleAccessLevel } from '../../common/role-guard'
import { IRoleValidator } from '../../domain/role/interface/service'

export class RoleValidator implements IRoleValidator {
    @IsOptional()
    @IsString()
    private id: string

    @IsDefined()
    @IsNotEmpty()
    private name: string

    @IsOptional()
    @IsIn([RoleAccessLevel.Read])
    private dashboard: RoleAccessLevel

    @IsOptional()
    @IsEnum(RoleAccessLevel)
    private event: RoleAccessLevel

    @IsOptional()
    @IsEnum(RoleAccessLevel)
    private eventRegistry: RoleAccessLevel

    @IsOptional()
    @IsEnum(RoleAccessLevel)
    private registrationForm: RoleAccessLevel

    @IsOptional()
    @IsEnum(RoleAccessLevel)
    private invitation: RoleAccessLevel

    @IsOptional()
    @IsEnum(RoleAccessLevel)
    private ticketValidate: RoleAccessLevel

    @IsOptional()
    @IsEnum(RoleAccessLevel)
    private directRegister: RoleAccessLevel

    @IsOptional()
    @IsIn([RoleAccessLevel.Full])
    private setting: RoleAccessLevel

    public getId() {
        if (!isEmpty(this.id)) {
            return this.id
        }
        const newId = toLower(trim(this.name))
        return replace(newId, /\s/g, '-')
    }

    public getDashboard(): RoleAccessLevel {
        return this.dashboard || null
    }

    public getDirectRegister(): RoleAccessLevel {
        return this.directRegister || null
    }

    public getEvent(): RoleAccessLevel {
        return this.event || null
    }

    public getEventRegistry(): RoleAccessLevel {
        return this.eventRegistry || null
    }

    public getInvitation(): RoleAccessLevel {
        return this.invitation || null
    }

    public getName(): string {
        return this.name || null
    }

    public getRegistrationForm(): RoleAccessLevel {
        return this.registrationForm || null
    }

    public getSetting(): RoleAccessLevel {
        return this.setting || null
    }

    public getTicketValidate(): RoleAccessLevel {
        return this.ticketValidate || null
    }

}
