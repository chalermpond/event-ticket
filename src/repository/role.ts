import {
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import {
    from,
    Observable,
} from 'rxjs'
import * as _ from 'lodash'
import { MongoRepository } from '../common/mongo-repository'
import { Db } from 'mongodb'

import {
    IRole,
    ModuleName,
    RoleAccessibility,
} from '../domain/role/interface/role'
import { IRoleRepository } from '../domain/role/interface/repository'
import { IRepositoryMapping } from '../common/interface/repository'
import { RoleModel } from '../domain/role/role.model'
import { map } from 'rxjs/operators'

export class RoleMongoRepository extends MongoRepository<IRole> implements IRoleRepository {
    constructor(db: Db) {
        super(db.collection('role'), new RoleMongoRepositoryMapping())
    }

    public save(model: IRole): Observable<any> {
        const document = this._mapper.serialize(model)
        return from(this._collection.insertOne(document)).pipe(
            map((resp: any) => {
                if (_.get(resp, 'result.n') === 1) {
                    return {
                        id: model.getId(),
                    }
                }
                throw new HttpException(`Save Error`, HttpStatus.INTERNAL_SERVER_ERROR)
            }),
        )
    }

    public getByID(id: string): Observable<IRole> {
        const query = {
            _id: id,
        }
        return from(this._collection.findOne(query)).pipe(
            map((doc: any) => this._mapper.deserialize(doc)),
        )
    }

    public searchByName(name: string): Observable<IRole> {
        return undefined
    }

    public delete(role: IRole): Observable<any> {
        return from(this._collection.deleteOne({
            _id: role.getId(),
        }))
    }

    public update(model: IRole): Observable<any> {
        const document = this._mapper.serialize(model)

        return from(this._collection.updateOne(
            {
                _id: model.getId(),
            }, {
                $set: document,
            }),
        ).pipe(
            map((resp: any) => {
                if (_.get(resp, 'result.n') === 1) {
                    return {
                        id: model.getId(),
                    }
                }
                throw new HttpException(`Update Error`, HttpStatus.INTERNAL_SERVER_ERROR)
            }),
        )
    }

}

export class RoleMongoRepositoryMapping implements IRepositoryMapping<IRole> {
    public deserialize(obj: any): IRole {
        if (_.isNil(obj)) {
            return null
        }
        const model = new RoleModel()
        const accessMap = new Map<ModuleName, RoleAccessibility>()
        _.forEach(obj.access, (value: string, key: string) => {
            accessMap.set(key as ModuleName, value as RoleAccessibility)
        })

        _.assign(model, {
            _id: obj._id,
            _name: obj.name,
            _users: new Set(obj.users),
            _accessMap: accessMap,
        })

        return model
    }

    public serialize(model: IRole): any {
        const access = {}
        _.forEach(ModuleName, name => {
            const result = model.getModuleAccessibility(name)
            if (!_.isNil(result)) {
                access[name] = result
            }
        })
        return {
            _id: model.getId(),
            name: model.getName(),
            users: model.getUsers(),
            access,
        }
    }

}
