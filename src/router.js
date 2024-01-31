import { Club } from './club.js'
import { DJ } from './dj.js'
import { Home } from './home.js'
import { Login } from './login.js'
import { Me } from './me.js'
import { EditUserProfile } from './edit_user_profile.js'
import { NewMilonga } from './new_milonga.js'
import { Milonga } from './milonga.js'
import { MilongaEvent } from './milonga_event.js'
import { NotFound } from './not_found.js'
import { AddMilongaEvent } from './add_milonga_event.js'
import { ChooseCountry } from './choose_country.js'
import { AllMilongaEvents } from './all_milonga_events.js'
import { AllDJs } from './all_djs.js'

export const showPageByHash = () => {
	console.log('showPageByHash')

	const countryCode = localStorage.getItem('country_code')
	if (!countryCode) {
		ChooseCountry()
		return;
	}

    const regexMilongaId = /^\#milonga\/[a-zA-Z0-9_\-]{8,}$/g;
    if (location.hash === '') {
        Home()
    } else if (location.hash === '#choose_country') {
		ChooseCountry()
	} else if (location.hash === '#login') {
		Login()
	} else if (location.hash === '#me') {
		Me()
    } else if (location.hash === '#edit_user_profile') {
		EditUserProfile()
    } else if (location.hash === '#milonga') {
        Milonga()
    } else if (location.hash === '#dj') {
		DJ()
    } else if (location.hash === '#milonga_event') {
		MilongaEvent()
    } else if (location.hash === '#club') {
        Club()
    } else if (location.hash === '#new_milonga') {
        NewMilonga()
    } else if (location.hash.indexOf("#add_milonga_event") === 0) {
        AddMilongaEvent()
    } else if (location.hash === '#all_milonga_events') {
        AllMilongaEvents()
    } else if (location.hash === '#all_djs') {
        AllDJs()
    } else if (regexMilongaId.test(location.hash)) { // #milonga/fdsafdsafdsa232432
        Milonga()
    } else {
		NotFound()
    }
	return;
}