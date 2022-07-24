import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Inject,
    Param,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import * as Moment from 'moment'
import { ProviderName } from '../provider'
import {
    Collection,
    Db,
    ObjectId,
} from 'mongodb'
import { FileInterceptor } from '@nestjs/platform-express'
import * as fs from 'fs'
import { file } from '@babel/types'
import { IConfig } from '../common/interface/config'
import {
    HandleBarService,
    TemplateType,
} from '../common/handle-bar-service'
import { EmailProvider } from '../common/email-provider'
import { RoleGuard } from '../common/role-guard'
import { map } from 'rxjs/operators'

const {
    MongoDBConnectionProvider,
    EnvConfigProvider,
    HandleBarServiceProvider,
    EmailServiceProvider,
} = ProviderName

@Controller('/register')
export class RegisterController {
    private readonly _invitationCollection: Collection
    private readonly _registrationCollection: Collection
    private readonly _eventCollection: Collection

    constructor(
        @Inject(MongoDBConnectionProvider)
        private readonly _mongoDb: Db,
        @Inject(EnvConfigProvider)
        private readonly _config: IConfig,
        @Inject(HandleBarServiceProvider)
        private readonly _handlebar: HandleBarService,
        @Inject(EmailServiceProvider)
        private readonly _email: EmailProvider,
    ) {
        this._invitationCollection = this._mongoDb.collection('invitation')
        this._registrationCollection = this._mongoDb.collection('registration')
        this._eventCollection = this._mongoDb.collection('event')
    }

    @UseGuards(RoleGuard)
    @Post('/')
    public directRegister(
        @Body() body: any,
    ) {
        let aName
        const dateTime = new Date()
        aName = 'default.png'
        const data = {
            // system generate field
            id: this.createRandomString(),
            refer: 'walk-in',
            event: body.event,
            created: dateTime,
            avatar: aName,
            // user input field
            name: body.name,
            surname: body.surname,
            position: body.position,
            organization: body.organization,
            address: body.address,
            bloc: body.bloc,
            lane: body.lane,
            road: body.road,
            district: body.district,
            city: body.city,
            province: body.province,
            postal: body.postal,
            phone: body.phone,
            mobile: body.mobile,
            fax: body.fax,
            email: body.email,
            checkIn: true,
        }
        return this._registrationCollection.insertOne(data).then(() => (
            {
                event: data.event,
                ticket: data.id,
            }
        ))

    }

    @Post('/:code')
    @UseInterceptors(FileInterceptor('file'))
    public register(
        @Param('code') code: string,
        @Body() body: any,
        // tslint:disable-next-line:no-shadowed-variable
        @UploadedFile() file: any,
        @Req() req,
    ): any {
        const host = req.hostname
        const port = req.port || this._config.application.port
        const selfUrl = `${req.protocol}://${host}`

        return this._invitationCollection.findOne({id: code})
            .then((invite) => {
                if (invite === null) {
                    throw new HttpException('your invite does not exist', HttpStatus.BAD_REQUEST)
                } else {
                    return invite
                }
            })
            .then((invite) => {
                console.log(invite)
                const inviteQuota = invite.quota
                return this._registrationCollection.find({refer: code})
                    .toArray()
                    .then((registersByCode) => {
                        const records = registersByCode.length
                        if (records >= inviteQuota) {
                            throw new HttpException('max reach', HttpStatus.BAD_REQUEST)
                        }
                        return registersByCode
                    }).then((register: any[]) => {
                        return {
                            invite,
                            register,
                        }
                    })
            })
            .then(({invite, register}: { invite: any, register: any[] }) => {
                let aName
                const dateTime = new Date()
                aName = 'default.png'
                if (typeof file === 'object') {
                    if (typeof file === 'object') {
                        const fileType = this.getFileExtension(file.originalname)
                        aName = `${dateTime.getTime()}.${fileType}`
                    }
                    fs.writeFile(`./uploads/avatars/${aName}`, file.buffer, (err) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log('Successfully written')
                        }
                    })
                }
                const data = {
                    // system generate field
                    id: this.createRandomString(),
                    refer: code,
                    event: invite.event,
                    created: dateTime,
                    avatar: aName,
                    // user input field
                    name: body.name,
                    surname: body.surname,
                    position: body.position,
                    organization: body.organization,
                    address: body.address,
                    bloc: body.bloc,
                    lane: body.lane,
                    road: body.road,
                    district: body.district,
                    city: body.city,
                    province: body.province,
                    postal: body.postal,
                    phone: body.phone,
                    mobile: body.mobile,
                    fax: body.fax,
                    email: body.email,
                }
                return this._registrationCollection.insertOne(data).then(() => (
                    {
                        event: data.event,
                        ticket: data.id,
                    }
                ))

            })
            .then(({event, ticket}: { event: string, ticket: string }) => {
                return this._eventCollection.findOne({_id: new ObjectId(event)})
                    .then((eventRecord) => {
                        if (eventRecord == null) {
                            throw new HttpException('your event invalid', HttpStatus.BAD_REQUEST)
                        }
                        return eventRecord
                    })
                    .then((eventData) => {
                        return this._registrationCollection.findOne({id: ticket})
                            .then((registerData) => {
                                const objectDateStart = new Date(eventData.startDate)
                                const objectDateEnd = new Date(eventData.endDate)

                                const month = objectDateStart.getMonth()
                                const year = objectDateStart.getFullYear()
                                const sDate = objectDateStart.getDate()
                                const eDate = objectDateEnd.getDate()

                                const sDatePart = Moment(objectDateStart).format('D MMMM YYYY')
                                const eDatePart = Moment(objectDateEnd).format('D MMMM YYYY')
                                let dateStr = ''
                                if (sDatePart === eDatePart) {
                                    dateStr = `${sDate}`
                                } else {
                                    dateStr = `${sDate}-${eDate}`
                                }

                                const monthDataset = {
                                    0: { title: 'January' },
                                    1: { title: 'February' },
                                    2: { title: 'March' },
                                    3: { title: 'April' },
                                    4: { title: 'May' },
                                    5: { title: 'June' },
                                    6: { title: 'July' },
                                    7: { title: 'August' },
                                    8: { title: 'September' },
                                    9: { title: 'October' },
                                    10: { title: 'November' },
                                    11: { title: 'December' },
                                }
                                const dateTime = `${dateStr} ${monthDataset[month].title} ${year}`

                                const payload = {
                                    // person
                                    name: registerData.name,
                                    surname: registerData.surname,
                                    // event
                                    eventTitle: eventData.name,
                                    eventSubtitle: eventData.subtitle,
                                    eventDate: dateTime,
                                    eventTimeStart: eventData.timeBegin,
                                    eventTimeEnd: eventData.timeEnd,
                                    eventAddress1: eventData.address1,
                                    eventAddress2: eventData.address2,
                                    // image
                                    ticketBarcode: `${selfUrl}/ticket/${event}/${ticket}/barcode`,
                                    eventLogo: null,
                                    eventTicket: `${selfUrl}/static/uploads/event/${eventData.ticketPath}`,
                                    ticketQr: `${selfUrl}/ticket/${event}/${ticket}/qr`,
                                    email: registerData.email,
                                }

                                const html = this._handlebar.compileTemplate(TemplateType.TicketEmail, payload)
                                return this._email.sendEmail([registerData.email],
                                    `Ticket: ${eventData.name}`,
                                    html,
                                    undefined,
                                ).pipe(
                                    map(() => {
                                        return {event, ticket}
                                    }),
                                )
                            })
                    })
            })
    }

    private createRandomString(): string {
        let result = ''
        const characters = '0123456789'

        for (let i = 0; i < 10; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length))
        }

        return `T${result}`
    }

    private getFileExtension(filename: string) {
        const path = filename.split('.')
        return path[1]
    }
}
