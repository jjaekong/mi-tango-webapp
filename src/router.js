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
import { EditMilongaSettings } from './edit_milonga_settings.js'
import { AddEvent } from './add_event.js'
import { Empty } from './empty.js'
import { Place } from './place.js'

export const showPageByHash = async () => {
	console.log('showPageByHash')
	document.body.classList.add('overflow-hidden')
    document.getElementById('loading')?.classList.remove('hidden')

	const countryCode = localStorage.getItem('country_code')
	if (!countryCode) {
		ChooseCountry()
		return;
	}

    const regexMilonga = /^\#milonga\/[a-zA-Z0-9_\-]{8,}$/g;
	const regexMilongaEvent = /^\#milonga_event\/[a-zA-Z0-9]{20,}$/g;

    if (location.hash === '') {
        await Home()
    } else if (location.hash === '#choose_country') {
		ChooseCountry()
	} else if (location.hash === '#login') {
		Login()
	} else if (location.hash === '#me') {
		await Me()
    } else if (location.hash === '#edit_user_profile') {
		EditUserProfile()
    } else if (location.hash === '#milonga') {
        Milonga()
    } else if (location.hash === '#dj') {
		DJ()
    } else if (regexMilongaEvent.test(location.hash)) {
		MilongaEvent()
    } else if (location.hash === '#place') {
        Place()
    } else if (location.hash === '#new_milonga') {
        NewMilonga()
    } else if (location.hash === '#all_milonga_events') {
        await AllMilongaEvents()
    } else if (location.hash === '#all_djs') {
        AllDJs()
    } else if (regexMilonga.test(location.hash)) { // #milonga/fdsafdsafdsa232432
        await Milonga()
    } else if (location.hash === '#add_event') {
        AddEvent()
    } else if (location.hash.indexOf("#add_milonga_event") === 0) {
        AddMilongaEvent()
    } else if (location.hash.indexOf("#edit_milonga_settings") === 0) {
		await EditMilongaSettings()
    } else if (location.hash === '#empty') {
		await Empty()
    } else {
		NotFound()
    }

	document.body.classList.remove('overflow-hidden')
    document.getElementById('loading')?.classList.add('hidden')
	return;
}