import './firebase.js'
import { html, render } from 'lit-html'
import { todaySection } from './home/today-section.js'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { userCircleOutline } from './icons.js'

onAuthStateChanged(getAuth(), user => {
    if (user) {
        render(html`
            <a href="me.html"><img class="block size-8 rounded-full" src="${user.photoURL}"></a>
        `, document.getElementById("profile"))
    } else {
        render(html`
            <a href="login.html" class="text-2xl font-bold">${userCircleOutline()}</a>
        `, document.getElementById("profile"))
    }
})

render(todaySection(), document.getElementById("main"))