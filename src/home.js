import { getAuth, onAuthStateChanged } from "@firebase/auth"
import { render, html } from "lit-html"
import { UserCircleOutlineIcon } from "./icons.js"

export const Home = () => {
    console.log('home')
    onAuthStateChanged(getAuth(), user => {
        if (user) {
            render(html`<a href="me.html"><img src="${user.photoURL}" class="size-8 rounded-full ring-2 ring-purple-700 ring-offset-2"></a>`, document.getElementById('user-profile'))
        } else {
            render(html`<a href="login.html">${UserCircleOutlineIcon({classList: 'size-8'})}</a>`, document.getElementById('user-profile'))
        }
    })
}