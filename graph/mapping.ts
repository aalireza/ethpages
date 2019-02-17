import { UserDataUpdated } from './types/Keybook/Keybook'
import { User } from './types/schema'

export function handleNewUsers(event: UserDataUpdated): void {
    let user = new User(event.params.email)
    user.email = event.params.email
    user.name = event.params.name
    user.telegram = event.params.telegram
    user.save()
}
