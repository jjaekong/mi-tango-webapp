import { html, render } from 'lit-html'
import './firebase_init.js'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { header } from './components/header.js';
import { arrowLeft } from './icons.js';

header({
    left: html`<a href="#" @click="${(e) => {
            e.preventDefault();
            history.back();
        }}">${arrowLeft({size: "size-6"})}</a>`,
    title: '내 프로필'
})

const setProfile = (user) => {
    if (!user) return
    render(html`<img class="rounded-full" src=${user.photoURL}>`, document.querySelector('#user-photo'))
    render(html`${user.displayName}`, document.querySelector('#user-name'))
    render(html`${user.email}`, document.querySelector('#user-email'))
}

const currentUser = getAuth().currentUser

if (currentUser) setProfile(currentUser)

onAuthStateChanged(getAuth(), user => {
    if (user) {
        setProfile(user)
    } else {
        location.replace('/')
    }
})

document.querySelector('#logout')?.addEventListener('click', function() {
    if (confirm("로그아웃 하시겠습니까?")) {
        const auth = getAuth()
        signOut(auth)
            .then(() => {
                location.replace('/')
            })
            .catch(error => {
                console.log(error)
            })
    }
})