import { showPageByHash } from "./router";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { existCountry } from "./country";
import dayjs from "dayjs/esm"
import 'dayjs/esm/locale/ko'
import localizedFormat from 'dayjs/esm/plugin/localizedFormat'
import advancedFormat from 'dayjs/esm/plugin/advancedFormat'

dayjs.locale('ko')
dayjs.extend(localizedFormat)
dayjs.extend(advancedFormat)

// console.log(navigator.)
// const navi = navigator.language.split('-')
const countryCode = localStorage.getItem("country_code")
if (countryCode) {
    if (!existCountry(countryCode)) {
        setCountryCode()
    }
} else {
    setCountryCode()
}

function setCountryCode() {
    // document.querySelector('html').setAttribute('lang', navigator.language)
    document.querySelector('html').setAttribute('lang', "es-ES")
    const naviLang = navigator.language.split('-')
    if (naviLang.length === 2) {
        if (existCountry(naviLang[1])) {
            localStorage.setItem('country_code', naviLang[1])
        }
    }
}

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

onAuthStateChanged(getAuth(), async user => {
    if (user) {
		const auth = getAuth()
		const db = getFirestore()
		const userRef = doc(db, `${process.env.MODE}.users`, user.uid)
		const userSanp = await getDoc(userRef)
        const userData = {
            email: user.email,
            emailVerified: user.emailVerified,
            uid: user.uid,
            photoURL: user.photoURL,
            displayName: user.displayName,
        }
		if (userSanp.exists()) {
            setDoc(userRef, {
				...userData,
                latestSignIn: new Date()
			}, { merge: true })
		} else {
			setDoc(userRef, userData, { merge: true })
		}
	}
})

getAuth().authStateReady()
    .then(() => {
        // document.body.classList.remove('overflow-hidden')
        // document.getElementById('loading')?.classList.add('hidden')
    })

window.addEventListener('DOMContentLoaded', e => {
    showPageByHash()
}, false)

window.addEventListener("hashchange", e => {
	console.log('hashchange', location)
    showPageByHash()
}, false)

window.addEventListener("beforeinstallprompt", e => {
	e.preventDefault();
	// installPrompt = event;
	console.log('install yet !!!!!!', e)
});