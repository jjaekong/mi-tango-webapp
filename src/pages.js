import { Club } from './club.js'
import { DJ } from './dj.js'
import { Home } from './home.js'
import { Login } from './login.js'
import { Me } from './me.js'
import { EditProfile } from './me/edit_profile.js'
import { Milonga } from './milonga.js'
import { MilongaEvent } from './milonga_event.js'
import { NotFound } from './not_found.js'

export const showPageByHash = () => {
	console.log('showPageByHash')
    if (location.hash === '') {
        Home()
    } else if (location.hash === '#login') {
		Login()
	} else if (location.hash === '#me') {
		Me()
    } else if (location.hash === '#me/edit_profile') {
		EditProfile()
    } else if (location.hash === '#milonga') {
        Milonga()
    } else if (location.hash === '#dj') {
		DJ()
    } else if (location.hash === '#milonga_event') {
		MilongaEvent()
    } else if (location.hash === '#club') {
        Club()
    } else {
		NotFound()
    }
}