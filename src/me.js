import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { Toolbar } from "./components/toolbar.js" 
import { html, render } from "lit-html"
import { ArrowLeftIcon } from "./icons.js"
import { getFirestore, doc, getDoc } from "firebase/firestore"

export const Me = () => {

    render(html`${Toolbar({
        left: html`<a href="#" @click="${e => { e.preventDefault(); history.back(); }}">${ArrowLeftIcon()}</a>`,
        title: '계정'
    })}`, document.getElementById('toolbar'))

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
	console.log('edit profile')
}

export const NewMilonga = () => {

	var user = null

	onAuthStateChanged(getAuth(), user => {
		if (user) {
			user = { ...{ email: user.email } }
		} else {
			location.href = '/'
		}
	})

	render(html`${ArrowLeftIcon()}`, document.querySelector('#toolbar .back'))

	document.querySelector('#toolbar .back').addEventListener('click', () => {
		history.back()
	})

	document.getElementById('new-milonga-form').addEventListener('submit', async e => {

		e.preventDefault()
		
		console.log('AAAAAAA', user)

		if (!user) return;

		console.log('BBBBBBBB')

		const milongaId = document.forms['new-milonga-form']?.elements['milonga-id']?.value

		if (milongaId) {
			const db = getFirestore()
			const docRef = doc(db, 'milongas', milongaId)
			const docSnap = await getDoc(docRef)
			if (docSnap.exists()) {
				console.log('있음')
			} else {
				console.log('없음')
			}
		}

	})
}