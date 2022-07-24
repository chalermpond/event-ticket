import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    Param,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common'
import { ProviderName } from '../provider'
import {
    Collection,
    Db,
    ObjectId,
} from 'mongodb'
import * as QRCode from 'qrcode'
import {
    HandleBarService,
    TemplateType,
} from '../common/handle-bar-service'
import { createCanvas } from 'canvas'
import * as Barcode from 'jsbarcode'
import { EmailProvider } from '../common/email-provider'
import { IConfig } from '../common/interface/config'
import * as _ from 'lodash'
import { RoleGuard } from '../common/role-guard'
import { of } from 'rxjs'
import { tap } from 'rxjs/operators'
import * as Moment from 'moment'

const {
    MongoDBConnectionProvider,
    HandleBarServiceProvider,
    EmailServiceProvider,
    EnvConfigProvider,
} = ProviderName

@Controller('/ticket')
export class TicketController {
    private readonly _registerCollection: Collection
    private readonly _eventCollection: Collection
    private readonly _urlPrefix: string

    constructor(
        @Inject(MongoDBConnectionProvider)
        private readonly _mongoDb: Db,
        @Inject(HandleBarServiceProvider)
        private readonly _handlebar: HandleBarService,
        @Inject(EmailServiceProvider)
        private readonly _email: EmailProvider,
        @Inject(EnvConfigProvider)
        private readonly _config: IConfig,
        @Inject(EnvConfigProvider)
        private readonly _conf: IConfig,
    ) {
        this._registerCollection = this._mongoDb.collection('registration')
        this._eventCollection = this._mongoDb.collection('event')
        this._urlPrefix = this._conf.links.registerDomain
    }

    @UseGuards(RoleGuard)
    @Get('/:event/registry')
    public retrieveGuestsByEvent(
        @Param('event') eventId: any,
    ): any {
        return this._registerCollection.find({event: eventId}).toArray()
    }

    @UseGuards(RoleGuard)
    @Get('/:event/:code/raw')
    public start(
        @Param('code') code: string,
        @Param('event') event: string,
    ) {
        return this._registerCollection.findOne({
            id: code,
            event,
        })
    }

    @Get('/:event/:code/status')
    public getTicketStatus(
        @Param('event') eventId: string,
        @Param('code') registerId: string, // id it's not _id
    ): any {
        return this._registerCollection.findOne({id: registerId, event: eventId})
            .then((ticket) => {
                const status = ticket.checkIn
                const res: any = {
                    checkIn: null,
                }
                if (status !== undefined) {
                    res.checkIn = status
                } else {
                    res.checkIn = false
                }
                return res
            })
    }

    @Get('/:event/:code/qr')
    public generateTicketQr(
        @Param('event') event: string,
        @Param('code') code: string,
        @Query('data') data: string,
        @Res() resp: any,
    ): any {
        const hostName = this._urlPrefix
        const verifyData = `${hostName}/ticket/${event}/${code}/verify`
        return this._registerCollection
            .findOne({id: code})
            .then((invite) => {
                if (invite == null) {
                    throw new HttpException('your invite invalid', HttpStatus.BAD_REQUEST)
                }
            })
            .then(() => {
                if (data === 'true') {
                    return QRCode.toDataURL(verifyData)
                        .then((res) => {
                            resp.writeHead(200, {
                                'Content-Type': 'text/html',
                                'Content-Length': res.length,
                            })
                            resp.end(res)
                        })
                } else {
                    QRCode.toDataURL(verifyData)
                        .then((res) => {
                            res = res.replace(/data:image\/png;base64,/, '')
                            const bufferValue = Buffer.from(res, 'base64')
                            resp.writeHead(200, {
                                'Content-Type': 'image/png',
                                'Content-Length': bufferValue.length,
                            })
                            resp.end(bufferValue)
                        })
                }
            })
    }

    @Get('/:event/:code/barcode')
    public generateTicketBarcode(
        @Param('event') eventId: string,
        @Param('code') code: string,
        @Query('data') data: string,
        @Res() resp,
    ): any {
        return this._registerCollection.findOne({event: eventId, id: code})
            .then((res) => {
                if (_.isObject(res)) {
                    // TODO remove it
                    // console.log('exist')
                } else {
                    throw new HttpException('event id or register id are invalid', HttpStatus.BAD_REQUEST)
                }
            })
            .then(() => {
                let mycanvas
                let res
                mycanvas = createCanvas(200, 200)
                Barcode(mycanvas, `${eventId}${code}`)
                const c = mycanvas.toDataURL().toString()
                res = c.replace(/data:image\/png;base64,/, '')
                if (data !== 'true') {
                    const bufferValue = Buffer.from(res, 'base64')
                    resp.writeHead(200, {
                        'Content-Type': 'image/png',
                        'Content-Length': bufferValue.length,
                    })
                    resp.end(bufferValue)
                } else {
                    resp.writeHead(200, {
                        'Content-Type': 'text/html',
                        'Content-Length': c.length,
                    })
                    resp.end(c)
                }
            })
    }

    @Get('/:event/:code')
    public getTicketHtml(
        @Param('event') event: string,
        @Param('code') code: string,
        @Req() req: any,
    ) {
        const eventId = new ObjectId(event)
        const host = req.hostname
        const port = req.port || this._config.application.port
        const selfUrl = `${req.protocol}://${host}`
        return this._eventCollection.findOne(eventId)
            .then((eventRecord: any) => {
                if (eventRecord == null) {
                    throw new HttpException('your event invalid', HttpStatus.BAD_REQUEST)
                }
                return eventRecord
            })
            .then((eventData: any) => {
                // TODO remove it
                // console.log(eventData)
                return this._registerCollection.findOne({id: code})
                    .then((registerData) => {
                        const objectDateStart = new Date(eventData.startDate)
                        const objectDateEnd = new Date(eventData.endDate)

                        const allDay = (eventData.allDay === '1' || eventData.allDay === true)

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

                        return {
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
                            allDay,
                            // image
                            ticketBarcode: `${selfUrl}/ticket/${event}/${code}/barcode`,
                            eventTicket: `${selfUrl}/static/uploads/event/${eventData.ticketPath}`,
                            ticketQr: `${selfUrl}/ticket/${event}/${code}/qr`,
                            email: registerData.email,
                            // checkIn: (registerData.checkIn === true) ? '' : 'none',
                        }
                    })
            })
            .then((res: any) => {
                // TODO remove it
                // console.log(res)
                return this._handlebar.compileTemplate(TemplateType.TicketEmail, res)
            })
    }

    @Post('/:event/:code')
    public checkIn(
        @Param('event') event,
        @Param('code') code,
        @Body() body: { secret: string },
    ) {
        return this.existTicket(code).then((exist) => {
            if (!exist) {
                throw new HttpException(`Ticket not found`, HttpStatus.BAD_REQUEST)
            }
        }).then(() => {
            return this._eventCollection.findOne({
                _id: new ObjectId(event),
                secret: body.secret,
            })
        }).then((eventData: any) => {
            if (_.isNil(eventData)) {
                throw new HttpException(`Invalid Request`, HttpStatus.BAD_REQUEST)
            }
            return eventData
        }).then((eventData: any) => {
            return this.statusTicket(code).then((checkIn) => {
                if (checkIn === '!checked') {
                    return this._registerCollection.updateOne({id: code, event},
                        {
                            $set: {
                                checkIn: true,
                                checkInTime: new Date(),
                            },
                        })
                } else {
                    throw new HttpException(`Ticket checked in`, HttpStatus.BAD_REQUEST)
                }
            })
        })
    }

    private existTicket(code: string): any {
        return this._registerCollection.find({id: code}).toArray().then((rec) => {
            return (rec.length > 0) ? true : false
        })
    }

    private statusTicket(code: string): any {
        return this._registerCollection.find({id: code}).toArray().then((rec) => {
            if (rec[0].checkIn !== undefined && rec[0].checkIn === true) {
                return 'checked'
            } else {
                return '!checked'
            }
        })
    }
}
