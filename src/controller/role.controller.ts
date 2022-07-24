import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    Patch,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common'
import { ProviderName } from '../provider'
import { IRoleService } from '../domain/role/interface/service'
import { RoleValidator } from './validator/role.validator'
import { RoleGuard } from '../common/role-guard'

@Controller('/role')
export class RoleController {
    constructor(
        @Inject(ProviderName.RoleServiceProvider)
        private readonly _roleService: IRoleService,
    ) {
    }

    /**
     * Create new role
     * @param body
     */
    @UseGuards(RoleGuard)
    @Post('/')
    public createNewRole(
        @Body() body: RoleValidator,
    ) {
        return this._roleService.createNewRole(body)
    }

    /**
     * Get all roles
     */
    @UseGuards(RoleGuard)
    @Get('/')
    public listAllRole() {
        return this._roleService.list()
    }

    /**
     * Assign user into role
     * @param id
     * @param body
     */
    @UseGuards(RoleGuard)
    @Patch('/:id/assign')
    public assignRole(
        @Param('id') id: string,
        @Body() body: string[],
    ) {
        return this._roleService.assignRole(id, body)
    }

    /**
     * Revoke role from user
     * @param id
     * @param users
     */
    @UseGuards(RoleGuard)
    @Patch('/:id/revoke')
    public revokeFromRole(
        @Param('id') id: string,
        @Body() users: string[],
    ) {
        return this._roleService.revokeRole(id, users)
    }

    /**
     * Delete role
     * @param id
     */
    @UseGuards(RoleGuard)
    @Delete('/:id')
    public deleteRole(
        @Param('id') id: string,
    ) {
        return this._roleService.deleteRole(id)
    }

    /**
     * Update role
     * @param id
     * @param body
     */
    @UseGuards(RoleGuard)
    @Put('/:id')
    public updateRole(
        @Param('id') id: string,
        @Body() body: RoleValidator,
    ) {
        return this._roleService.updateRole(id, body)
    }
}
