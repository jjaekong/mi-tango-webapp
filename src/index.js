import { html, render } from 'lit-html'
import { todaySection } from './home/today-section.js'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { userCircleOutline } from './icons.js'

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBjlBi8FCJF2CHKQcOx7OrN9J3PFM7_iyg",
    authDomain: "mi-tango-365.firebaseapp.com",
    databaseURL: "https://mi-tango-365-default-rtdb.firebaseio.com",
    projectId: "mi-tango-365",
    storageBucket: "mi-tango-365.appspot.com",
    messagingSenderId: "956666689230",
    appId: "1:956666689230:web:91786a791bbf7468ee829f",
    measurementId: "G-JC6NCDNBX7"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);

onAuthStateChanged(getAuth(), user => {
    if (user) {
        console.log('user', user)
    } else {
        render(html`
            <a href="login.html" class="text-2xl font-bold">${userCircleOutline()}</a>
        `, document.getElementById("profile"))
    }
})

render(todaySection(), document.getElementById("main"))