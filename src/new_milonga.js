import { render, html } from "lit-html"
import { cache } from 'lit-html/directives/cache.js'
import { ArrowLeftIcon } from './icons'
import { getAuth } from "firebase/auth"
import { arrayUnion, doc, getDoc, getFirestore, setDoc } from "firebase/firestore"
import { goBack } from './util'

export const NewMilonga = async () => {

    const auth = getAuth()

    await auth.authStateReady()

    const currentUser = auth.currentUser
    
    if (!currentUser) {
        location.replace("#")
    }

    async function newMilonga(e) {
        e.preventDefault()


        const milongaId = document.forms['new-milonga-form'].elements['milonga-id'].value
		const regexMilongaId = new RegExp(/^[a-zA-Z0-9_-]{8,}$/g)
		if (!regexMilongaId.test(milongaId)) {
			alert('밀롱가 아이디를 요청한 형식에 맞게 입력하세요.')
			document.forms['new-milonga-form'].elements['milonga-id'].focus()
			return
		}
		
        const milongaName = document.forms['new-milonga-form'].elements['milonga-name'].value
		if (!milongaName) {
			document.forms['new-milonga-form'].elements['milonga-name'].focus()
			return
		}

        const db = getFirestore()
        const milongaRef = doc(db, `${process.env.MODE}.milongas`, milongaId)
        const milongaSnap = await getDoc(milongaRef)
        if (milongaSnap.exists()) {
            alert('이미 사용 중인 밀롱가 아이디입니다.')
            milongaId.focus()
            return;
        }

        const promise1 = setDoc(milongaRef, {
			countryCode: localStorage.getItem('country_code'),
            createdBy: currentUser.email,
            createdAt: new Date(),
            organizers: [{
                name: currentUser.displayName,
                photoURL: currentUser.photoURL,
                email: currentUser.email
            }],
            editors: [],
            name: milongaName
        })

        const promise2 = setDoc(doc(db, `${process.env.MODE}.users`, currentUser.uid), {
            createdMilongas: arrayUnion(milongaId)
        }, { merge: true })

        Promise.all([promise1, promise2])
            .then(() => {
                location.replace(`#milonga/${milongaId}`)
                return
            })
            .catch(error => {
                console.log(error)
            })
    }

    render(html`
        <div class="me new-milonga p-5">
            <header class="flex items-center mb-5 h-10 w-full">
				<div class="min-w-[20%]"><a href="#" @click=${goBack}>${ArrowLeftIcon()}</a></div>
				<div class="flex-1"><h1 class="font-bold text-center">밀롱가 만들기</h1></div>
				<div class="min-w-[20%] flex justify-end"></div>
			</header>
            <form action="#" method="post" @submit=${newMilonga} id="new-milonga-form">
				<div class="mb-3">
                    <label class="sr-only" for="country-code">국가코드</label>
                    <input type="text" placeholder="국가코드" id="country-code" name="country-code" disabled autocomplete="off" value=${localStorage.getItem('country_code')}>
                </div>
                <div class="mb-3">
                    <label class="sr-only" for="milonga-name">밀롱가명</label>
                    <input type="text" placeholder="밀롱가명" id="milonga-name" name="milonga-name" required autocomplete="off">
                </div>
                <div class="mb-3">
                    <label class="sr-only" for="milonga-id">밀롱가 아이디</label>
                    <input type="text" placeholder="밀롱가 아이디" id="milonga-id" name="milonga-id" required autocomplete="off" minlength="8">
                    <div class="form-help">영문, 숫자, 언더바(_), 대쉬(-)를 이용하여 8자 이상으로 작성하세요.</div>
                </div>
                <div class="mt-4">
                    <button type="submit" class="btn-primary w-full">만들기</button>
                </div>
            </form>
        </div>
    `, document.getElementById('app'))
}