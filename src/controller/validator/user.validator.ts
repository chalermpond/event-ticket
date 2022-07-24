import { IUserValidator } from '../../domain/user/interface'
import {
    IsBoolean,
    IsDefined,
    IsEmail,
    IsOptional,
    IsString,
    Matches,
    MinLength,
} from 'class-validator'

export class UserValidator implements IUserValidator {
    @IsDefined()
    @Matches(/^[A-Za-z0-9.\-]+/)
    @MinLength(6)
    private id: string

    @IsOptional()
    @IsString()
    private name: string

    @IsOptional()
    @IsEmail()
    private email: string

    @IsOptional()
    @IsString()
    private password: string

    @IsOptional()
    @IsString()
    private phone: string

    @IsOptional()
    @IsBoolean()
    private suspended: boolean

    public getId(): string {
        return this.id
    }

    public getEmail(): string {
        return this.email
    }

    public getName(): string {
        return this.name
    }

    public getPassword(): string {
        return this.password
    }

    public getPhone(): string {
        return this.phone
    }

    public getSuspended(): boolean {
        return !!this.suspended
    }

}
