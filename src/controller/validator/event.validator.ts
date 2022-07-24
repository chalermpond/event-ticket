import {
    IsBoolean,
    IsBooleanString,
    IsDefined,
    IsEnum,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator'
import { RegisterTemplateName } from '../../domain/event/interface/event'

export class EventValidator {
    @IsOptional()
    @IsString()
    public id: string

    @IsDefined()
    @IsString()
    public name: string

    @IsOptional()
    @IsString()
    public subtitle: string

    @IsDefined()
    @IsString()
    public address1: string
    @IsDefined()
    @IsString()
    public address2: string

    @IsOptional()
    @IsString()
    public logo: string

    @IsOptional()
    @IsString()
    public banner: string

    @IsDefined()
    @IsString()
    @IsEnum(RegisterTemplateName)
    public template: RegisterTemplateName

    @IsDefined()
    @IsNumberString()
    public startDate: string

    @IsOptional()
    @IsString()
    public startTime: string = '00:00'

    @IsDefined()
    @IsNumberString()
    public endDate: string

    @IsOptional()
    @IsString()
    public endTime: string = '23:59'

    @IsDefined()
    @IsNumberString()
    public maxSeats: string

    @IsDefined()
    @IsBooleanString()
    public enforceMax = true

    @IsDefined()
    @IsBooleanString()
    public allowWalkIn = true

    @IsDefined()
    @IsBooleanString()
    public allDay = false

    @IsDefined()
    @IsNumberString()
    public startRegister: string

    @IsDefined()
    @IsNumberString()
    public endRegister: string

    @IsOptional()
    @IsString()
    public note: string

    @IsOptional()
    @IsString()
    public hero: string

    @IsDefined()
    @IsString()
    @MinLength(4)
    public secret: string

    @IsOptional()
    @IsString()
    public inviteText: string

}
