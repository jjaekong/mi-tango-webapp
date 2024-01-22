import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import  { Home } from './home.js'
import  { Login } from './login.js'
import  { Me, EditProfile } from './me.js'
import  { NewMilonga } from './new_milonga.js'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { setDoc, getDoc, getFirestore, doc } from "firebase/firestore";
import { ENV } from "./config.js";

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
		const userRef = doc(db, `${ENV}.users`, user.uid)
		const userSanp = await getDoc(userRef)
		if (userSanp.exists()) {
		} else {
			setDoc(userRef, {
				email: user.email,
				emailVerified: user.emailVerified,
				uid: user.uid,
				photoURL: user.photoURL,
				displayName: user.displayName,
			}, { merge: true })
		}
	}
})

window.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('home')) {
        Home()
    } else if (document.body.classList.contains('login')) {
        Login()
    } else if (document.body.classList.contains('me')) {
		if (document.body.classList.contains('main')) {
			Me()
		} else if (document.body.classList.contains('edit-profile')) {
			EditProfile()
		}
    } else if (document.body.classList.contains('new-milonga')) {
        NewMilonga()
    } else {
		location.href = '404.html'
	}
})