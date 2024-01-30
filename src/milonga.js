import { getAuth } from 'firebase/auth'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { render, html } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'
import { ArrowLeftIcon } from './icons'

export const Milonga = async () => {

	// const auth = getAuth()

	// await auth.authStateReady()

    const milongaId = location.hash.split('/')[1]

    console.log('milonga id ', milongaId)

    const db = getFirestore()
    const milongaRef = doc(db, `${process.env.MODE}.milongas`, milongaId)
    const milongaSnap = await getDoc(milongaRef)

    if (!milongaSnap.exists()) {
        location.replace('#')
    }

    const milongaData = milongaSnap.data()

	render(cache(html`
        <div class="milonga p-5" role="document">
            <header class="flex items-center mb-5 h-10 w-full">
				<div class="min-w-[20%]"><a href="#" @click=${e => { e.preventDefault(); history.back() }}>${ArrowLeftIcon()}</a></div>
				<div class="flex-1"><h1 class="font-bold text-center">밀롱가 홈</h1></div>
				<div class="min-w-[20%] flex justify-end"></div>
			</header>
            <div class="milonga-profile p-5 flex bg-white rounded-xl shadow-xl shadow-slate-100">
                <div>
                    <img src="https://picsum.photos/100/100" class="block size-16">
                </div>
                <div class="flex-1 mx-3">${milongaData.name}</div>
            </div>
            <section>
                <header>
                    <h4>다가오는 밀롱가 이벤트</h4>
                </header>
            </section>
        </div>
	`), document.getElementById('app'))
}