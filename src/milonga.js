import { getAuth } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from 'firebase/firestore'
import { render, html } from 'lit-html'
import { MilongaEventItem } from './components/milonga_event_item'
import { ArrowLeftIcon } from './icons'
import dayjs from 'dayjs/esm'
import { hasPermitToEditMilonga } from './service'
import { goBack } from './util'

export const Milonga = async () => {

	const auth = getAuth()
	await auth.authStateReady()
    const currentUser = auth.currentUser

	const milongaId = location.hash.split('/')[1]

    console.log('milonga id ', milongaId)

    const db = getFirestore()
    const milongaRef = doc(db, `${process.env.MODE}.milongas`, milongaId)
	const milongaSnap = await getDoc(milongaRef)
	if (!milongaSnap.exists()) {
		location.replace('#')
		return;
	}
	
	const milongaData = {
		id: milongaSnap.id,
		...milongaSnap.data()
	}

	const milongaEventsQuery = query(
		collection(db, `${process.env.MODE}.milonga_events`),
        where('milonga.id', '==', milongaId),
        where("startAt", ">=", dayjs().add(-6, 'hour').hour(6).minute(0).second(0).toDate())
	)
	const milongaEventsSnap = await getDocs(milongaEventsQuery)

	render((html`
        <div class="milonga p-5" role="document">
            <header class="flex items-center mb-5 h-10 w-full" id="toolbar">
				<div class="min-w-[20%]"><a href="#" @click=${goBack}}>${ArrowLeftIcon()}</a></div>
				<div class="flex-1"><h1 class="font-bold text-center sr-only">밀롱가</h1></div>
				<div class="min-w-[20%] flex justify-end"></div>
			</header>
            <div class="milonga-profile flex mb-4">
                <div class="flex-none">
                    <!-- <img src="https://picsum.photos/100/100" class="block size-24 rounded-3xl"> -->
                    <div class="size-24 rounded-3xl empty:bg-slate-200" id="milonga-logo"></div>
                </div>
                <div class="mx-3 flex-1">
					<h4 class="font-bold text-lg empty:bg-slate-200 empty:h-6 empty:w-[50%]" id="milonga-name">
						${milongaData.name}
					</h4>
				</div>
            </div>
            <section class="p-5 mb-4 rounded-xl bg-white shadow-xl shadow-slate-100" id="upcoming-milonga-events">
                <header class="mb-5 flex items-center justify-between">
                    <h4 class="font-bold text-lg">다가오는 이벤트</h4>
                </header>
				${  milongaEventsSnap.empty
                        ? html`<p class="text-sm text-slate-500 mt-3">등록된 밀롱가 이벤트가 없습니다.</p>`
                        : html`
                            <ul>
                                ${
                                    milongaEventsSnap.docs.map(doc => html`<li class="mt-3">${ MilongaEventItem({ id: doc.id, ...doc.data() }) }</li>`)
                                }
                            </ul>`
                }
            </section>
        </div>
	`), document.getElementById('app'))

    if (hasPermitToEditMilonga(milongaData, currentUser.email)) {
		render(
			html`<a class="text-blue-500 font-bold" href="#edit_milonga_settings?milongaId=${milongaId}">설정</a>`,
			document.querySelector('#toolbar > div:nth-of-type(3)')
		)
		render(
			html`<a class="text-blue-500 font-bold" href="#add_milonga_event?milongaId=${milongaId}">이벤트 추가</a>`,
			document.querySelector('#upcoming-milonga-events header')
		)
	}
}