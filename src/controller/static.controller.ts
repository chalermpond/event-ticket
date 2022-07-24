import {
    Controller,
    Get,
    Param,
    Post,
    Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { RoleGuard } from '../common/role-guard'
import {
    FileFieldsInterceptor,
    FileInterceptor,
} from '@nestjs/platform-express'
import * as fs from 'fs'

@Controller('/static')
export class StaticController {

    @UseGuards(RoleGuard)
    @Post('/upload')
    @UseInterceptors(FileInterceptor('file'))
    public uploadFile(
        @UploadedFile() file,
        @Req() req,
    ) {
        const fileName = `${Date.now()}-${file.originalname}`
        const path = `./uploads/misc/${fileName}`
        fs.writeFileSync(path, file.buffer)
        const host = req.hostname
        const selfUrl = `${req.protocol}://${host}`
        return {
            success: true,
            data: {
                link: `${selfUrl}/static/uploads/misc/${fileName}`,
            },
            alt: fileName,
        }
    }

    @Get('/uploads/*')
    public sendUploadFile(
        @Req() req,
        @Res() res,
    ) {
        res.sendFile(req.params[0], {root: 'uploads'})
    }

    @Get('/*')
    public sendFile(
        @Req() req,
        @Res() res,
    ) {
        res.sendFile(req.params[0], {root: 'static'})
    }
}
