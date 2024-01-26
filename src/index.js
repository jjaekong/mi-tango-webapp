import { Club } from './club.js'
import { DJ } from './dj.js'
import { Home } from './home.js'
import { Login } from './login.js'
import { Me } from './me.js'
import { Milonga } from './milonga.js'
import { MilongaEvent } from './milonga_event.js'
import { NotFound } from './not_found.js'

const showPageByHash = () => {
	console.log('showPageByHash')
    if (location.hash === '') {
        Home()
    } else if (location.hash === '#login') {
		Login()
	} else if (location.hash === '#me') {
		Me()
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

window.addEventListener('DOMContentLoaded', e => {
    showPageByHash()
})

window.addEventListener("hashchange", e => {
	console.log('hashchange', location)
    showPageByHash()
}, false)