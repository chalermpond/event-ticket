import * as Hbs from 'hbs'
import * as fs from 'fs'

export enum TemplateType {
    TicketEmail = 'ticket-email',
    InviteEmail = 'invite-email',
}

export class HandleBarService {
    public compileTemplate(
        type: TemplateType,
        data: any,
    ) {
        let source
        let template
        let html
        let content
        let fileLocal
        fileLocal = `./vendor/email-template/${type}.hbs`
        content = data
        source = fs.readFileSync(fileLocal, 'utf8')
        template = Hbs.compile(source.toString())
        html = template(content)
        return html
    }
}
