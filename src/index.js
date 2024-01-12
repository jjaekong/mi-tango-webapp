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
            <a href="login.html" class="text-2xl font-bold text-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
            </a>
        `, document.getElementById("profile"))
    }
})

render(todaySection(), document.getElementById("main"))