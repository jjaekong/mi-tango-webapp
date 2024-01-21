import { getAuth, onAuthStateChanged } from "firebase/auth"
import { html, render } from "lit-html"
import { ArrowLeftIcon } from "./icons.js"
import { getFirestore, doc, getDoc, setDoc, arrayUnion } from "firebase/firestore"
import { ENV } from "./config.js"

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
			const mRef = doc(db, `${ENV}.milongas`, milongaId)
			const mSnap = await getDoc(mRef)
			if (mSnap.exists()) {
                alert('이미 사용 중인 밀롱가 아이디입니다.');
				document.querySelector('#new-milonga-form input[name="milonga-id"]').focus();
				return;
			} else {
                const promise2 = setDoc(mRef, {
                        createdAt: new Date(),
                        createdBy: userInfo.uid,
                        name: milongaName,
                        organizers: [userInfo.uid]
                    })
                const promise1 = setDoc(doc(`${ENV}.users`), {
                        "createdMilongas": arrayUnion(userInfo.uid)
                    })
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