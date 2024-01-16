import { getAuth, onAuthStateChanged, signOut } from "@firebase/auth"
import { Toolbar } from "./components/toolbar.js" 
import { html, render } from "lit-html"

export const Me = () => {

    render(html`${Toolbar({title: '계정'})}`, document.getElementById('toolbar'))

    const setProfile = (user) => {
        if (!user) return
        render(html`<img class="rounded-full" src=${user.photoURL}>`, document.querySelector('#user-photo'))
        render(html`${user.displayName}`, document.querySelector('#user-name'))
        render(html`${user.email}`, document.querySelector('#user-email'))
    }

    const currentUser = getAuth().currentUser

    if (currentUser) setProfile(currentUser)

    onAuthStateChanged(getAuth(), user => {
        if (user) setProfile(user)
        else location.href = '/'
    })
    
    document.getElementById('logout').addEventListener('click', function() {
        if (confirm('로그아웃 하시겠습니까?')) {
            signOut(getAuth())
                .then(() => {
                    location.href = '/'
                })
                .catch(error => {
                    console.log(error)
                })
        }
    })
}