import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { Toolbar } from "./components/toolbar.js" 
import { html, render } from "lit-html"
import { ArrowLeftIcon, ChevronRightIcon } from "./icons.js"
import { getFirestore, doc, getDoc, setDoc, arrayUnion } from "firebase/firestore"
import { ENV } from "./config.js"

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

	render(html`${Toolbar({
        left: html`<a href="#" @click="${e => { e.preventDefault(); history.back(); }}">${ArrowLeftIcon()}</a>`,
        title: '프로필 수정'
    })}`, document.getElementById('toolbar'))
    
}

export const NewMilonga = () => {

	let userInfo = null

	onAuthStateChanged(getAuth(), user => {
		if (user) {
			userInfo = {
                email: user.email,
                uid: user.uid
            }
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

		if (!userInfo) return;

        console.log('userInfo', userInfo)

		const milongaId = document.forms['new-milonga-form']?.elements['milonga-id']?.value
        const milongaName = document.forms['new-milonga-form']?.elements['milonga-name']?.value

		if (milongaId) {
            const db = getFirestore()
			const milongaRef = doc(db, `${ENV}.milongas`, milongaId)
			const milongaSnap = await getDoc(milongaRef)
			if (milongaSnap.exists()) {
                alert('이미 사용 중인 밀롱가 아이디입니다.');
				document.querySelector('#new-milonga-form input[name="milonga-id"]').focus();
				return;
			} else {
                const promise2 = setDoc(milongaRef, {
                        createdAt: new Date(),
                        createdBy: userInfo.uid,
                        name: milongaName,
                        organizers: [userInfo.uid],
						editors: [userInfo.uid]
                    })
                const promise1 = setDoc(doc(db, `${ENV}.users`, userInfo.uid), {
                        "createdMilongas": arrayUnion(milongaId)
                    }, { merge: true })
                Promise.all([promise1, promise2])
                    .then(() => {
                        location.href = `/milonga.html?mid=${milongaId}`
                    })
                    .catch(error => {
                        console.log(error)
                    })
            }
		} else {
            return;
        }
	})
}