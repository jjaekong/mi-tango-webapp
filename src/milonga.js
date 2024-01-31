import { getAuth } from 'firebase/auth'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { render, html } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'
import { map } from 'lit-html/directives/map.js'
import { MilongaEventItem } from './components/milonga_event_item'
import { ArrowLeftIcon } from './icons'

export const hasPermitToEditMilonga = () => {
	
}

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
            <div class="milonga-profile p-5 flex bg-white rounded-xl shadow-xl shadow-slate-100 mb-4">
                <div>
                    <img src="https://picsum.photos/100/100" class="block size-16 rounded-lg">
                </div>
                <div class="flex-1 mx-3 font-bold">${milongaData.name}</div>
            </div>
			<a href="#add_milonga_event?mid=${milongaId}" class="block p-3 bg-purple-500 text-white rounded-lg text-center mb-4">밀롱가 이벤트 추가</a>
            <section class="mb-4">
                <header>
                    <h4>다가오는 밀롱가 이벤트</h4>
                </header>
				<ul>
					${
						map([10, 100, 1000, 1050, 550], item => html`<li class="mt-3">${MilongaEventItem(item)}</li>`)
					}
				</ul>
            </section>
        </div>
	`), document.getElementById('app'))
}