import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { Toolbar } from "./components/toolbar.js" 
import { html, render } from "lit-html"
import { ArrowLeftIcon, ChevronRightIcon } from "./icons.js"
import { getFirestore, doc, getDoc } from "firebase/firestore"

const aaaa = 'aaaa'

export const Me = () => {

    render(html`${Toolbar({
        left: html`<a href="#" @click="${e => { e.preventDefault(); history.back(); }}">${ArrowLeftIcon()}</a>`,
        title: '계정'
    })}`, document.getElementById('toolbar'))

	render(html`${ChevronRightIcon()}`, document.querySelector('#edit-profile-icon'))

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

export const EditProfile = () => {
	
	const auth = getAuth()
	const user = auth.currentUser
	console.log('edit profile', aaaa)

	render(html`${Toolbar({
        left: html`<a href="#" @click="${e => { e.preventDefault(); history.back(); }}">${ArrowLeftIcon()}</a>`,
        title: '프로필 수정'
    })}`, document.getElementById('toolbar'))
}