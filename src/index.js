import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { setDoc, getDoc, getFirestore, doc } from "firebase/firestore";
import { ENV } from "./config.js";
import { Home } from './home'
import { Login } from './login.js'
import { Me, EditProfile, NewMilonga } from './me.js'
import { Milonga } from "./milonga.js";
import { MilongaEvent } from "./milonga_event.js";

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

const unsubscribe = onAuthStateChanged(getAuth(), async user => {
    unsubscribe()
	if (user) {
		const auth = getAuth()
		const db = getFirestore()
		const userRef = doc(db, `${ENV}.users`, user.uid)
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

// window.addEventListener('beforeunload', () => {
//     unsubscribe()
// })

window.addEventListener('DOMContentLoaded', async () => {
    if (document.body.classList.contains('home')) {
		// const { Home } = await import('./home.js')
		Home()
    } else if (document.body.classList.contains('login')) {
			Login()
    } else if (document.body.classList.contains('me')) {
		if (document.body.classList.contains('main')) {
				Me()
		} else if (document.body.classList.contains('edit-profile')) {
				EditProfile()
		} else if (document.body.classList.contains('new-milonga')) {
				NewMilonga()
		}
    } else if (document.body.classList.contains('club')) {
		Club()
	} else if (document.body.classList.contains('dj')) {
		DJ()
	} else if (document.body.classList.contains('milonga')) {
		Milonga()
	} else if (document.body.classList.contains('milonga-event')) {
		MilongaEvent()
	} else {
		location.href = '404.html'
	}
})