import { Club } from './club.js'
import { DJ } from './dj.js'
import { Home } from './home.js'
import { Login } from './login.js'
import { Me } from './me.js'
import { Milonga } from './milonga.js'
import { MilongaEvent } from './milonga_event.js'
import { NotFound } from './not_found.js'

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
	apiKey: "AIzaSyBjlBi8FCJF2CHKQcOx7OrN9J3PFM7_iyg",
	authDomain: "mi-tango-365.firebaseapp.com",
	databaseURL: "https://mi-tango-365-default-rtdb.firebaseio.com",
	projectId: "mi-tango-365",
	storageBucket: "mi-tango-365.appspot.com",
	messagingSenderId: "956666689230",
	appId: "1:956666689230:web:9857a6d2027b587fee829f",
	measurementId: "G-Q9KPWCTZ9N"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
}, false)

window.addEventListener("hashchange", e => {
	console.log('hashchange', location)
    showPageByHash()
}, false)