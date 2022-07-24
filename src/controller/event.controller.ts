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
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'

import { parse } from 'json2csv'
import * as _ from 'lodash'
import { ProviderName } from '../provider'
import { EventService } from '../domain/event/event.service'
import { StringToNumberPipeTransform } from '../common/pipe-transform'
import { EventValidator } from './validator/event.validator'
import { RoleGuard } from '../common/role-guard'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import {
    catchError,
    map,
    tap,
} from 'rxjs/operators'
import * as fs from 'fs'
import { IEventDto } from '../domain/event/interface/dto'
import {
    Collection,
    Db,
    ObjectId,
} from 'mongodb'
import {
    forkJoin,
    from,
} from 'rxjs'
import { IConfig } from '../common/interface/config'
import { mergeMap } from 'rxjs/internal/operators/mergeMap'
import * as Moment from 'moment'

const {
    EnvConfigProvider,
} = ProviderName

@Controller('/event')
export class EventController {
    private readonly _registrationCollection: Collection
    private readonly _invitation: Collection
    private readonly _eventCollection: Collection
    private readonly _urlPrefix: string

    constructor(
        @Inject(ProviderName.EventServiceProvider)
        private readonly _eventService: EventService,
        @Inject(ProviderName.MongoDBConnectionProvider)
        private readonly _mongoDb: Db,
        @Inject(EnvConfigProvider)
        private readonly _config: IConfig,
        @Inject(EnvConfigProvider)
        private readonly _conf: IConfig,
    ) {
        this._registrationCollection = this._mongoDb.collection('registration')
        this._invitation = this._mongoDb.collection('invitation')
        this._eventCollection = this._mongoDb.collection('event')
        this._urlPrefix = this._conf.links.registerDomain
    }

    @UseGuards(RoleGuard)
    @Post('/')
    @UseInterceptors(FileFieldsInterceptor([
        {name: 'banner', maxCount: 1},
        {name: 'ticket', maxCount: 1},
        {name: 'hero', maxCount: 1},
        {name: 'logo', maxCount: 1},
        {name: 'doc', maxCount: 1},
    ]))
    public createNewEvent(
        @Body() body: EventValidator,
        @UploadedFiles() files: any,
    ) {
        return this._eventService.createNewEvent(body).pipe(
            catchError(err => {
                throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
            }),
            tap((data: any) => {
                if (_.isObject(files.banner)) {
                    data.banner = this._getFileUpload(files.banner[0].originalname, data.id, 'banner')

                    fs.writeFile(`./uploads/event/${data.banner}`, files.banner[0].buffer, (err) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log('banner saved')
                        }
                    })
                } else {
                    console.log('banner does not upload')
                }
            }),
            tap((data: any) => {
                if (_.isObject(files.ticket)) {
                    data.ticket = this._getFileUpload(files.ticket[0].originalname, data.id, 'ticket')
                    fs.writeFile(`./uploads/event/${data.ticket}`, files.ticket[0].buffer, (err) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log('ticket saved')
                        }
                    })
                } else {
                    console.log('ticket does not upload')
                }
            }),
            tap((data: any) => {
                if (_.isObject(files.logo)) {
                    data.logo = this._getFileUpload(files.logo[0].originalname, data.id, 'logo')
                    fs.writeFile(`./uploads/event/${data.logo}`, files.logo[0].buffer, (err) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log('logo saved')
                        }
                    })
                } else {
                    console.log('logo does not upload')
                }
            }),
            tap((data: any) => {
                console.log(data)
                if (_.isObject(files.hero)) {
                    data.hero = this._getFileUpload(files.hero[0].originalname, data.id, 'hero')
                    fs.writeFile(`./uploads/event/${data.hero}`, files.hero[0].buffer, (err) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log('hero saved')
                        }
                    })
                } else {
                    console.log('hero does not upload')
                }
            }),
            tap((data: any) => {
                console.log(data)
                if (_.isObject(files.doc)) {
                    data.doc = this._getFileUpload(files.doc[0].originalname, data.id, 'doc')
                    fs.writeFile(`./uploads/event/${data.doc}`, files.doc[0].buffer, (err) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log('doc saved')
                        }
                    })
                } else {
                    console.log('doc does not upload')
                }
            }),
            tap((data: any) => {
                console.log(data)
                const eId = new ObjectId(data.id)
                const where = {
                    _id: eId,
                }
                const editData = {
                    bannerPath: data.banner,
                    logoPath: data.logo,
                    hero: data.hero,
                    ticketPath: data.ticket,
                    docPath: data.doc,
                }
                this._eventCollection.updateOne(where, {$set: editData})
            }),
        )
    }

    private _getFileUpload(
        filename: any,
        id: string,
        subject: string,
    ) {
        const string = filename.toString().split('.')
        return `${id}-${subject}.${string[1]}`
    }

    @UseGuards(RoleGuard)
    @Get('/')
    public listAllEvents(
        @Query('page', StringToNumberPipeTransform) page: number,
        @Query('limit', StringToNumberPipeTransform) limit: number,
    ) {
        if (_.isNil(page) || _.isNil(limit)) {
            return this._eventService.getAllEvent(1, 20)
        }
        return this._eventService.getAllEvent(page, limit)
    }

    @Get('/:id')
    public getDeepDetail(
        @Param('id') id: string,
    ) {
        return this.getEventDetail(id).pipe(map((data: any) => {
            data.info = undefined
            data.secret = undefined

            return data
        }))
    }

    @UseGuards(RoleGuard)
    @Get('/:id/deep')
    public getEventDetail(
        @Param('id') id: string,
    ) {
        let returnData = {}
        return this._eventService.getEventById(id).pipe(
            mergeMap((event: IEventDto) => {
                returnData = event
                const regis = this._registrationCollection.find({
                    event: event.id.toString(),
                }).toArray()
                const invite = this._invitation.find({
                    event: event.id.toString(),
                }).toArray()
                return forkJoin(from(regis), from(invite))
            }),
            map((join: any[]) => {
                const regis = join[0]
                const invites = join[1]

                const registered = regis.length
                const invited = _.reduce(invites, (acc, item) => {
                    return acc + _.toNumber(item.quota)
                }, 0)
                const attend = _.reduce(regis, (acc, item) => {
                    if (!_.isNil(item.checkIn) && !!item.checkIn) {
                        return acc + 1
                    }
                    return acc
                }, 0)
                return _.assign(returnData, {
                    info: {
                        attend,
                        registered,
                        invited,
                    },
                })
            }),
        )
    }

    @UseGuards(RoleGuard)
    @Get('/:eventId/registry/export')
    @Header('Content-Type', 'text/csv')
    @Header('Content-Disposition', 'attachment;filename=registry.csv')
    public exportRegistry(
        @Param('eventId') eventId: string,
    ) {
        const fields = [
            'name',
            'surname',
            'email',
            'ticket',
            'refer',
            'event',
            'created',
            'position',
            'organization',
            'address',
            'bloc',
            'lane',
            'road',
            'district',
            'city',
            'province',
            'postal',
            'phone',
            'mobile',
            'fax',
            'checkIn',
            'checkInTime',
        ]

        return this._eventCollection.findOne({_id: new ObjectId(eventId)})
            .then((eventDoc: any) => {
                return eventDoc.name
            }).catch((err) => {
                throw new HttpException('Cannot fetch Event data to export ',
                    HttpStatus.NOT_FOUND,
                )
            }).then((eventName: string) => {
                return this._registrationCollection.find({
                    event: eventId,
                })
                    .toArray()
                    .then((docs: any[]) => {
                        return docs.map(doc => {
                            return {
                                name: doc.name,
                                surname: doc.surname,
                                email: doc.email,
                                ticket: doc.id,
                                refer: doc.refer,
                                event: eventName,
                                created: doc.created,
                                position: doc.position,
                                organization: doc.organization,
                                address: doc.address,
                                bloc: doc.bloc,
                                lane: doc.lane,
                                road: doc.road,
                                district: doc.district,
                                city: doc.city,
                                province: doc.province,
                                postal: doc.postal,
                                phone: doc.phone,
                                mobile: doc.mobile,
                                fax: doc.fax,
                                checkIn: (doc.checkIn ? 'yes' : 'no'),
                                checkInTime: doc.checkInTime || '',
                            }
                        })
                    })
            }).then(mapData => {
                const opts = {fields}
                return parse(mapData, opts)
            })
    }

    @UseGuards(RoleGuard)
    @Get('/:eventId/registry')
    public listRegistry(
        @Param('eventId') eventId: string,
    ) {
        const fields = [
            'name', 'surname', 'email', 'ticket',
        ]
        return this._registrationCollection.find({
            event: eventId,
        }).toArray()
            .then((docs: any[]) => {
                return docs.map(doc => {
                    return {
                        name: doc.name,
                        surname: doc.surname,
                        email: doc.email,
                        ticket: doc.id,
                    }
                })
            }).then(mapData => {
                const opts = {fields}
                return parse(mapData, opts)
            })
    }

    @UseGuards(RoleGuard)
    @Put('/:id')
    @UseInterceptors(FileFieldsInterceptor([
        {name: 'banner', maxCount: 1},
        {name: 'ticket', maxCount: 1},
        {name: 'hero', maxCount: 1},
        {name: 'logo', maxCount: 1},
        {name: 'doc', maxCount: 1},
    ]))
    public updateEvent(
        @Param('id') id: string,
        @Body() body: EventValidator,
        @UploadedFiles() files: any,
    ) {
        return this._eventService.updateEvent(id, body).pipe(
            tap((data: any) => {
                if (_.isObject(files.banner)) {
                    const filename = this._getFileUpload(files.banner[0].originalname, data.id, 'banner')
                    const bannerPath = `./uploads/event/${filename}`
                    this._eventCollection.updateOne({
                        _id: new ObjectId(id),
                    }, {
                        $set: {
                            bannerPath: filename,
                        },
                    })
                    fs.access(bannerPath, (err) => {
                        if (err) {
                            console.error('banner not found')
                        } else {
                            fs.unlink(bannerPath, () => {
                                console.log('banner removed')
                            })
                        }

                        fs.writeFile(bannerPath, files.banner[0].buffer, (er) => {
                            if (er) {
                                console.log(er)
                            } else {
                                console.log('banner saved')
                            }
                        })
                    })
                } else {
                    console.log('!banner upload')
                }
            }),
            tap((data: any) => {
                if (_.isObject(files.ticket)) {
                    const filename = this._getFileUpload(files.ticket[0].originalname, data.id, 'ticket')
                    const ticketPath = `./uploads/event/${filename}`
                    this._eventCollection.updateOne({
                        _id: new ObjectId(id),
                    }, {
                        $set: {
                            ticketPath: filename,
                        },
                    })
                    fs.access(ticketPath, (err) => {
                        if (err) {
                            console.log('ticket not found')
                        } else {
                            fs.unlink(ticketPath, () => {
                                console.log('ticket removed')
                            })
                        }

                        fs.writeFile(ticketPath, files.ticket[0].buffer, (er) => {
                            if (er) {
                                console.log(er)
                            } else {
                                console.log('ticket saved')
                            }
                        })
                    })
                } else {
                    console.log('!ticket upload')
                }
            }),
            tap((data: any) => {
                if (_.isObject(files.logo)) {
                    const filename = this._getFileUpload(files.logo[0].originalname, data.id, 'logo')
                    const logoPath = `./uploads/event/${filename}`
                    this._eventCollection.updateOne({
                        _id: new ObjectId(id),
                    }, {
                        $set: {
                            logoPath: filename,
                        },
                    })
                    fs.access(logoPath, (err) => {
                        if (err) {
                            console.log('logo not found')
                        } else {
                            fs.unlink(logoPath, () => {
                                console.log('logo removed')
                            })
                        }

                        fs.writeFile(logoPath, files.logo[0].buffer, (er) => {
                            if (er) {
                                console.log(er)
                            } else {
                                console.log('logo saved')
                            }
                        })
                    })
                } else {
                    console.log('!logo upload')
                }
            }),
            tap((data: any) => {
                if (_.isObject(files.hero)) {
                    const filename = this._getFileUpload(files.hero[0].originalname, data.id, 'hero')
                    const heroPath = `./uploads/event/${filename}`
                    this._eventCollection.updateOne({
                        _id: new ObjectId(id),
                    }, {
                        $set: {
                            hero: filename,
                        },
                    })
                    fs.access(heroPath, (err) => {
                        if (err) {
                            console.log('hero not found')
                        } else {
                            fs.unlink(heroPath, () => {
                                console.log('hero removed')
                            })
                        }

                        fs.writeFile(heroPath, files.hero[0].buffer, (er) => {
                            if (er) {
                                console.log(er)
                            } else {
                                console.log('hero saved')
                            }
                        })
                    })
                } else {
                    console.log('!hero upload')
                }
            }),
            tap((data: any) => {
                if (_.isObject(files.doc)) {
                    const filename = this._getFileUpload(files.doc[0].originalname, data.id, 'doc')
                    const docPath = `./uploads/event/${filename}`
                    this._eventCollection.updateOne({
                        _id: new ObjectId(id),
                    }, {
                        $set: {
                            docPath: filename,
                        },
                    })
                    fs.access(docPath, (err) => {
                        if (err) {
                            console.log('doc not found')
                        } else {
                            fs.unlink(docPath, () => {
                                console.log('doc removed')
                            })
                        }

                        fs.writeFile(docPath, files.doc[0].buffer, (er) => {
                            if (er) {
                                console.log(er)
                            } else {
                                console.log('doc saved')
                            }
                        })
                    })
                } else {
                    console.log('!doc upload')
                    const filename = `${id}-doc.pdf`
                    const docPath = `./uploads/event/${filename}`
                    this._eventCollection.updateOne({
                        _id: new ObjectId(id),
                    }, {
                        $set: {
                            docPath: '',
                        },
                    })
                    fs.access(docPath, (err) => {
                        if (err) {
                            console.log('doc not found')
                        } else {
                            fs.unlink(docPath, () => {
                                console.log('doc removed')
                            })
                        }
                    })
                }
            }),
        )
    }

    @UseGuards(RoleGuard)
    @Delete('/:id')
    public deleteEvent(
        @Param('id') id: string,
    ) {
        return this._eventService.deleteEvent(id)
    }

    @Get('/:event/summary')
    public eventSummary(
        @Param('event') eventId: string,
        @Req() req: any,
    ): any {
        const host = req.hostname
        const port = req.port || this._config.application.port
        const selfUrl = `${req.protocol}://${host}`

        const objEventId = new ObjectId(eventId)
        return this._eventCollection.findOne(objEventId)
            .then((eventRec) => {
                const editEventRec = {
                    title: eventRec.name,
                    subtitle: eventRec.subtitle,
                    maxSeats: eventRec.maxSeats,
                    eventDate: this._getDateTimeFormat(eventRec.startDate, eventRec.endDate),
                    registerDate: this._getDateTimeFormat(eventRec.registerStart, eventRec.registerEnd),
                    inviteCreated: null,
                    inviteUsed: null,
                    invited: null,
                }
                return editEventRec
            })
            .then((tempData) => {
                return this._invitation.find({event: eventId})
                    .toArray()
                    .then((inviteRecs) => {
                        tempData.inviteCreated = _.reduce(inviteRecs, (acc, current) => {
                            return acc + _.toNumber(current.quota)
                        }, 0)
                        return tempData
                    })
            })
            .then((tempData) => {
                return this._invitation.find({event: eventId})
                    .toArray()
                    .then((inviteRecs) => {
                        const reformattedArray = inviteRecs.map(obj => {
                            return {
                                shortCode: obj.id,
                                inviteName: obj.name,
                                email: obj.email,
                                type: obj.type,
                                quota: obj.quota,
                                qr: `${selfUrl}/invite/${obj.id}/qr`,
                                link: `${this._urlPrefix}/page/register?code=${obj.id}`,
                            }
                        })
                        tempData.invited = reformattedArray
                        return tempData
                    })
            })
            .then((tempData) => {
                return this._registrationCollection.find({event: eventId})
                    .toArray()
                    .then((registerRecs) => {
                        tempData.inviteUsed = registerRecs.length
                        return tempData
                    })
            })
    }

    private _getDateTimeFormat(
        start: string,
        end: string,
    ): any {
        const objectDateStart = new Date(start)
        const objectDateEnd = new Date(end)

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
        return dateTime
    }
}
