import { render, html } from "lit-html"
import { cache } from 'lit-html/directives/cache.js'
import { ArrowLeftIcon } from './icons'
import { getAuth } from "firebase/auth"
import { arrayUnion, doc, getDoc, getFirestore, setDoc } from "firebase/firestore"

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
        const milongaName = document.forms['new-milonga-form'].elements['milonga-name'].value
        if (!milongaId) return

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
            createdBy: currentUser.uid,
            createdAt: new Date(),
            organizers: [currentUser.uid],
            editors: [],
            name: milongaName
        })

        const promise2 = setDoc(doc(db, `${process.env.MODE}.users`, currentUser.uid), {
            createdMilongas: arrayUnion(milongaId)
        }, { merge: true })

        Promise.all([promise1, promise2])
            .then(() => {
                // location.href = `#milonga/${milongaId}`
                location.replace(`#milonga/${milongaId}`)
            })
            .catch(error => {
                console.log(error)
            })
    }

    render(cache(html`
        <div class="me new-milonga p-5">
            <header class="flex items-center mb-5 h-10 w-full">
				<div class="min-w-[20%]"><a href="#" @click=${e => {
                    e.preventDefault();
                    history.back()
                }}>${ArrowLeftIcon()}</a></div>
				<div class="flex-1"><h1 class="font-bold text-center">밀롱가 만들기</h1></div>
				<div class="min-w-[20%] flex justify-end"></div>
			</header>
            <form action="#" method="post" @submit=${newMilonga} id="new-milonga-form">
				<div class="mb-3">
                    <label>
                        <div class="sr-only">국가코드</div>
                        <input type="text" placeholder="국가코드" name="country-code" class="rounded-lg border-slate-200 block w-full disabled:bg-slate-100" disabled autocomplete="off" value=${localStorage.getItem('country_code')}>
                    </label>
                </div>
                <div class="mb-3">
                    <label>
                        <div class="sr-only">밀롱가명</div>
                        <input type="text" placeholder="밀롱가명" name="milonga-name" class="rounded-lg border-slate-200 block w-full" required autocomplete="off">
                    </label>
                </div>
                <div class="mb-3">
                    <label>
                        <div class="sr-only">밀롱가 아이디</div>
                        <input type="text" placeholder="밀롱가 아이디" name="milonga-id" class="rounded-lg border-slate-200 block w-full" required pattern="[0-9a-zA-Z_]{8,}" autocomplete="off">
                    </label>
                    <div class="text-slate-500 text-xs p-2">영문, 숫자, 언더바(_), 대쉬(-)를 이용하여 8자 이상으로 작성하세요.</div>
                </div>
                <div class="mt-4">
                    <button type="submit" class="p-3 bg-purple-500 text-white block w-full rounded-lg">만들기</button>
                </div>
            </form>
        </div>
    `), document.getElementById('app'))
}