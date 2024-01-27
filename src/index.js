import { showPageByHash } from "./pages";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { ENV } from "./config";

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
        document.body.classList.remove('overflow-hidden')
        document.getElementById('loading').classList.add('hidden')
    })

window.addEventListener('DOMContentLoaded', e => {
    showPageByHash()
}, false)

window.addEventListener("hashchange", e => {
	console.log('hashchange', location)
    showPageByHash()
}, false)