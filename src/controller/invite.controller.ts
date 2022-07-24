import * as _ from 'lodash'
import {
    Body,
    Controller,
    Delete,
    Get,
    Header,
    HttpException,
    HttpStatus,
    Inject,
    Param,
    Post,
    Put,
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
import * as Docx from 'docx'
import * as Stream from 'stream'
import { EmailProvider } from '../common/email-provider'
import { EventMongoRepository } from '../repository'
import { tap } from 'rxjs/internal/operators/tap'
import { IEvent } from '../domain/event/interface/event'
import {
    map,
    mergeMap,
} from 'rxjs/operators'
import {
    from,
    NEVER,
    Observable,
    throwError,
} from 'rxjs'
import { IConfig } from '../common/interface/config'
import { RoleGuard } from '../common/role-guard'
import { of } from 'rxjs/internal/observable/of'

const {
    EmailServiceProvider,
    MongoDBConnectionProvider,
    EventRepositoryProvider,
    EnvConfigProvider,
} = ProviderName

@Controller('/invite')
export class InviteController {
    private readonly _invitationCollection: Collection
    private readonly _registrationCollection: Collection
    private readonly _eventCollection: Collection
    private readonly _urlPrefix: string

    constructor(
        @Inject(MongoDBConnectionProvider)
        private readonly _mongoDb: Db,
        @Inject(EmailServiceProvider)
        private readonly _email: EmailProvider,
        @Inject(EventRepositoryProvider)
        private readonly _eventRepo: EventMongoRepository,
        @Inject(EnvConfigProvider)
        private readonly _conf: IConfig,
    ) {
        this._invitationCollection = this._mongoDb.collection('invitation')
        this._registrationCollection = this._mongoDb.collection('registration')
        this._eventCollection = this._mongoDb.collection('event')
        this._urlPrefix = this._conf.links.registerDomain
    }

    @UseGuards(RoleGuard)
    @Post('/')
    public createInvite(
        @Body() body,
        @Req() req: any,
    ): any {
        const dateTime = new Date()
        const query = req.query
        let eventModel: IEvent

        return this._eventRepo.getById(body.event).pipe(
            tap((model: IEvent) => {
                // Check if event existed
                if (_.isNil(model)) {
                    throw new HttpException('Event not found',
                        HttpStatus.BAD_REQUEST,
                    )
                }
                eventModel = model
            }),
            map((model: IEvent) => {
                // extract event max seat and enforcement
                const max: number = model.getMaxSeats()
                const enforce: boolean = model.getEnforceMax()
                return {
                    max,
                    enforce,
                }
            }),
            mergeMap(({max, enforce}: { max: number, enforce: boolean }): Observable<any[]> => {
                console.log(max, enforce)
                // get current create invite for this event
                return from(this._getTotalEventInvited(body.event)).pipe(
                    tap((obj: any[]) => {
                        // invite should not exceed quota
                        let total = obj.reduce((acc: number, doc: any) => acc + doc.quota, 0)
                        total += body.quota
                        if (total > max && !!enforce) {
                            throw new HttpException('Max Quota reached',
                                HttpStatus.BAD_REQUEST)
                        }
                    }),
                )
            }),
            map(() => {
                // prepare insert data
                return {
                    id: this.createRandomString(),
                    event: body.event,
                    created: dateTime,
                    quota: body.quota,
                    name: body.name,
                    type: body.type,
                    email: body.email,
                    address: body.address,
                    message: body.message,
                }
            }),
            mergeMap((data: any) => {
                return from(this._invitationCollection.insertOne(data)).pipe(
                    map(() => {
                        return {code: data.id}
                    }),
                )
            }),
            mergeMap(({code}: { code: string }) => {
                if (_.isNil(query.email) || query.email !== 'true') {
                    return of({code})
                }
                const mails: string[] = _.split(body.email, ',')
                return this._sentInviteEmail(mails, eventModel, code, req).pipe(
                    map((emailResponse) => {
                        return {
                            code,
                            email: {
                                accepted: emailResponse.accepted,
                                rejected: emailResponse.rejected,
                            },
                        }
                    }),
                )
            }),
            map((data) => data),
        )
    }

    @UseGuards(RoleGuard)
    @Delete('/:code')
    public deleteInvite(@Param('code') id: string) {
        return this._registrationCollection.find({refer: id}).toArray().then((result) => {
            const inviteUsed = result.length
            if (inviteUsed === 0) {
                return this._invitationCollection.deleteOne({id})
            } else {
                throw new HttpException('cannot delete invite', HttpStatus.BAD_REQUEST)
            }
        })
    }

    @Get('/:invite/download')
    @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    @Header('Content-Disposition', 'attachment;filename=word.docx')
    public downloadDoc(
        @Param('invite') invite: string,
        @Req() req: any,
        @Res() res: any,
    ) {
        const hostName = this._urlPrefix
        const url = `${hostName}/page/register?code=${invite}`
        return this._invitationCollection.findOne({id: invite})
            .then((doc: any) => {
                if (_.isNil(doc)) {
                    throw new HttpException('cannot find invite',
                        HttpStatus.NOT_FOUND)
                }
                return doc
            })
            .then((doc: any) => {
                return QRCode.toDataURL(url)
                    .then((data: string) => data)
            })
            .then((data: string) => {
                const doc = new Docx.Document()
                const raw = data.replace(/^data:image\/png;base64,/, '')
                doc.createParagraph(url)
                doc.createImage(raw)

                const packer = new Docx.Packer()
                return packer.toBuffer(doc).then((buffer) => {
                    return buffer
                })
            }).then((buffer: any) => {

                const readStream = new Stream.PassThrough()
                readStream.end(buffer)
                readStream.pipe(res)
            })

    }

    @UseGuards(RoleGuard)
    @Get('/')
    public retrieveInvite(): any {
        return this._invitationCollection.find().toArray().then((items: any[]) => {
            return _.assign(items, {
                manually: 'add field',
            })
        })
    }

    @Get('/:code')
    public getInviteDate(
        @Param('code') code: string,
    ): any {
        return this._invitationCollection.findOne({id: code})
            .then((resp) => {
                delete resp._id
                return resp
            })
            .catch(() => {
                throw new HttpException(`Invite not found`, HttpStatus.NOT_FOUND)
            })
    }

    @Get('/:code/qr')
    public generateInviteQrCode(
        @Param('code') code: string,
        @Query('data') data: string,
        @Res() resp,
        @Req() req: any,
    ): any {
        const hostName = this._urlPrefix
        const url = `${hostName}/page/register?code=${code}`
        if (data === 'true' || data === '1') {
            return QRCode.toDataURL(url)
                .then((res) => {
                    resp.writeHead(200, {
                        'Content-Type': 'text/html',
                        'Content-Length': res.length,
                    })
                    resp.end(res)
                })
        } else {
            QRCode.toDataURL(url)
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
    }

    @UseGuards(RoleGuard)
    @Put('/:code')
    public updateInvite(
        @Param('code') code: string,
        @Body() body,
        @Req() req): any {
        const data = {
            id: code,
            created: body.created,
            quota: body.quota,
            name: body.name,
            type: body.type,
            email: body.email,
            address: body.address,
            message: body.message,
            event: body.event,
        }
        const where = {id: code}
        const editData = {$set: data}
        return this._invitationCollection.updateOne(where, editData)
            .then((resp) => {
                const query = req.query
                if (_.isNil(query.email) || query.email !== 'true') {
                    return resp
                }
                return this._eventRepo.getById(body.event).pipe(
                    mergeMap((eventModel: IEvent) => {
                        const mails: string[] = _.split(body.email, ',')
                        return this._sentInviteEmail(mails, eventModel, code, req)
                    }),
                    map((emailResp) => {
                        return {
                            code,
                            email: {
                                accepted: emailResp.accepted,
                                rejected: emailResp.rejected,
                            },
                        }
                    }),
                )

            })
    }

    @Put('/:code/quota')
    public updateQuotaInvite(
        @Param('code') code: string,
        @Body() body,
    ): any {
        const inputQuota = _.parseInt(body.quota)
        return this._registrationCollection.find({refer: code})
            .toArray()
            .then((guestRefInviteId) => {
                return {
                    registered: guestRefInviteId.length,
                }
            })
            .then((adjustQuota) => {
                return this._invitationCollection.findOne({id: code})
                    .then((inviteRec) => {
                        return {
                            registered: adjustQuota.registered,
                            eventId: inviteRec.event,
                        }
                    })
            })
            .then((tempData) => {
                const objEventId = new ObjectId(tempData.eventId)
                return this._eventCollection.findOne(objEventId)
                    .then((eventRec) => {
                        const enforceMax = eventRec.enforceMax
                        const eventMaxSeats = eventRec.maxSeats
                        const registered = tempData.registered
                        if (enforceMax) {
                            const adjustQuota = inputQuota + registered
                            if (adjustQuota <= eventMaxSeats !== true) {
                                throw new HttpException('your quota must less than number of max seats ', HttpStatus.BAD_REQUEST)
                            }
                        } else {
                            if (inputQuota >= registered !== true) {
                                throw new HttpException('your quota must greater than number of registered', HttpStatus.BAD_REQUEST)
                            }
                        }
                    })
                    .then(() => {
                        const where = {id: code}
                        const editData = {$set: {quota: inputQuota}}
                        return this._invitationCollection.updateOne(where, editData)
                    })
            })
    }

    @UseGuards(RoleGuard)
    @Get('/:event/invited')
    public retrieveInviteByEvent(
        @Param('event') eventId: string,
    ): any {
        const objEventId = new ObjectId(eventId)
        return this._eventCollection.findOne(objEventId)
            .then((eventRecord) => {
                if (!(_.isObject(eventRecord))) {
                    throw new HttpException('your event invalid', HttpStatus.BAD_REQUEST)
                }
                return eventRecord
            })
            .then((eventData) => {
                return this._invitationCollection.find({event: eventId})
                    .toArray()
                    .then((res) => {
                        return {
                            invited: res.length,
                            maxSeats: eventData,
                        }
                    })
            })
            .then((r: any) => {
                r.maxSeats = r.maxSeats.maxSeats
                return r
            })
    }

    private createRandomString(): string {
        let result = ''
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

        for (let i = 0; i < 7; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length))
        }

        return result
    }

    private _getTotalEventInvited(code: string): Promise<any[]> {
        console.log({id: code})
        return this._invitationCollection.find({event: code}).toArray()
    }

    private _sentInviteEmail(mails: string[], eventModel: IEvent, code: string, req): Observable<any> {
        const host = req.hostname
        const selfUrl = `${req.protocol}://${host}`
        let dlLink = ''
        if (!_.isNil(eventModel.getDocPath()) && eventModel.getDocPath() !== '') {
            dlLink = `<p><a href="${selfUrl}/static/uploads/event/${eventModel.getDocPath()}"
            >กดที่นี่เพื่อดาวน์โหลดเอกสารแนบ Please click here to download document</a>
</p>`
        }

        const inviteText = eventModel.getInviteText() +
            `
${dlLink}
<p>*กรุณาสแกน QR หรือกดที่รูปเพื่อลงทะเบียน Please scan QR or click on image to register</p>
<div><a href="${this._urlPrefix}/page/register?code=${code}">
                <img alt="QR Code"
                 src="${selfUrl}/invite/${code}/qr" />
            </a></div>
`
        return this._email.sendEmail(
            mails,
            `คำเชิญ/Invite: ${eventModel.getName()}`,
            inviteText,
            null,
        )
    }
}
