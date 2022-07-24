import {
    IRole,
    ModuleName,
} from './interface/role'
import { IRoleDto } from './interface/dto'

export function toRoleDTO(model: IRole): IRoleDto {
    return {
        id: model.getId(),
        name: model.getName(),
        accessibility: {
            dashboard: model.getModuleAccessibility(ModuleName.Dashboard),
            event: model.getModuleAccessibility(ModuleName.Event),
            eventRegistry: model.getModuleAccessibility(ModuleName.EventRegistry),
            registrationForm: model.getModuleAccessibility(ModuleName.RegistrationForm),
            invitation: model.getModuleAccessibility(ModuleName.Invitation),
            ticketValidate: model.getModuleAccessibility(ModuleName.TicketValidate),
            directRegister: model.getModuleAccessibility(ModuleName.DirectRegister),
            setting: model.getModuleAccessibility(ModuleName.Setting),
        },
        users: model.getUsers(),
    }
}
