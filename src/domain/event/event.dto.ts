import { IEvent } from './interface/event'
import { IEventDto } from './interface/dto'

export class EventDto {
    public static toEventDto(event: IEvent): IEventDto {
        return {
            id: event.getId(),
            name: event.getName(),
            logo: event.getLogoPath(),
            banner: event.getBannerPath(),
            hero: event.getHero(),
            subtitle: event.getSubtitle(),
            address1: event.getAddress1(),
            address2: event.getAddress2(),
            secret: event.getSecret(),
            eventDate: {
                startDate: event.getStartDate().getTime(),
                endDate: event.getEndDate().getTime(),
                beginTime: event.getEventTimeBegin(),
                endTime: event.getEventTimeEnd(),
            },
            registerDate: {
                startDate: event.getRegisterStartDate().getTime(),
                endDate: event.getRegisterEndDate().getTime(),
            },
            maxSeats: event.getMaxSeats(),
            note: event.getNote(),
            template: event.getTemplate(),
            flags: {
                enforceMax: event.getEnforceMax(),
                allowWalkIn: event.isAllowWalkIn(),
                isAllDay: event.isAllDay(),
                isActivated: event.isActivated(),
            },
            inviteText: event.getInviteText() || '',
        }
    }

}
