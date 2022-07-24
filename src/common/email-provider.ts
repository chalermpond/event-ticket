import { IConfig } from './interface/config'
import {
    from,
    Observable,
} from 'rxjs'
import * as NodeMailer from 'nodemailer'
import * as Mail from 'nodemailer/lib/mailer'
import { map } from 'rxjs/operators'

export class EmailProvider {

    private readonly _transporter: Mail

    constructor(
        private readonly _config: IConfig,
    ) {

        this._transporter = NodeMailer.createTransport({
            host: _config.email.host,
            port: _config.email.port,
            secure: _config.email.secure,
            auth: {
                user: _config.email.user,
                pass: _config.email.pass,
            },
        })
    }

    public sendEmail(
        to: string[],
        subject: string,
        html: string,
        attachments: any[]): Observable<any> {

        const mailOptions = {
            from: `"Smart Regis" <${this._config.email.user}>`,
            to,
            subject,
            html,
            attachments,
        }

        return from(this._transporter.sendMail(mailOptions)).pipe(
            map((resp) => {
                return resp
            }),
        )

    }

}
