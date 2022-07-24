
export interface IRoleDto {
    id: string
    name: string
    accessibility: IAccessibilityDto
    users: string[]
}

interface IAccessibilityDto {
    dashboard: string
    event: string
    eventRegistry: string
    registrationForm: string
    invitation: string
    ticketValidate: string
    directRegister: string
    setting: string
}
