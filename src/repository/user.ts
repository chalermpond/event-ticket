import { IUserRepository } from '../domain/user/interface/repository'
import { MongoRepository } from '../common/mongo-repository'
import { IUser } from '../domain/user/interface'
import {
    from,
    Observable,
} from 'rxjs'
import { Db } from 'mongodb'
import { IRepositoryMapping } from '../common/interface/repository'
import { UserModel } from '../domain/user/user.model'
import { map } from 'rxjs/operators'
import * as _ from 'lodash'
import {
    HttpException,
    HttpStatus,
} from '@nestjs/common'

export class UserMongoRepository extends MongoRepository<IUser> implements IUserRepository {
    constructor(db: Db) {
        super(db.collection('user'), new UserMongoRepositoryMapping())

    }

    getById(id: string): Observable<IUser> {
        const query = {
            _id: _.toString(id),
        }
        return from(this._collection.findOne(query)).pipe(
            map((doc: any) => this._mapper.deserialize(doc)),
        )
    }

    save(model: IUser): Observable<any> {
        const document = this.toDocument(model)
        return from(this._collection.insertOne(document)).pipe(
            map((resp: any) => {
                if (_.get(resp, 'result.n') === 1) {
                    return {
                        id: model.getUserName(),
                    }
                }
                throw new HttpException(`Save Error`, HttpStatus.INTERNAL_SERVER_ERROR)
            }),
        )
    }

    update(model: IUser): Observable<any> {
        const document = this._mapper.serialize(model)

        return from(this._collection.updateOne(
            {
                _id: model.getUserName(),
            }, {
                $set: document,
            }),
        ).pipe(
            map((resp: any) => {
                if (_.get(resp, 'result.n') === 1) {
                    return {
                        id: model.getUserName(),
                    }
                }
                throw new HttpException(`Update Error`, HttpStatus.INTERNAL_SERVER_ERROR)
            }),
        )
    }

}

export class UserMongoRepositoryMapping implements IRepositoryMapping<IUser> {
    public deserialize(object: any): IUser {
        if (_.isNil(object)) {
            return null
        }
        const deSerializedUser = new UserModel()
        Object.assign(deSerializedUser, {
            _name: object.name,
            _user: object._id,
            _salt: object.salt,
            _email: object.email,
            _suspended: object.status === 'suspended',
            _password: object.secret,
            _phone: object.phone,
        })
        return deSerializedUser
    }

    public serialize(model: any): any {
        return {
            _id: model.getUserName(),
            name: model.getName(),
            email: model.getEmail(),
            status: !!model._suspended ? 'suspended' : 'active',
            secret: model._password,
            salt: model._salt,
            phone: model.getPhone(),
        }
    }

}
