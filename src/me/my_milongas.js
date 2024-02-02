import { collection, getDocs, getFirestore, query, where } from "firebase/firestore"
import { html, nothing } from "lit-html"
import { map } from 'lit-html/directives/map.js'
import { AtSymbolIcon, CalendarDaysSolidIcon, ForwardOutlineIcon } from "../icons"

export const MyMilongas = async (currentUser) => {

	const countryCode = localStorage.getItem('country_code')
	const db = getFirestore()
	const q = query(collection(db, `${process.env.MODE}.milongas`), where('createdBy', '==', currentUser.uid))
	const qSnap = await getDocs(q)

	console.log(qSnap)

	qSnap.forEach((doc) => {
		console.log(doc.id, " => ", doc.data());
	});

	return html`
		<section class="mb-4 p-5 bg-white rounded-xl shadow-xl shadow-slate-100">
			<header class="flex items-center flex-wrap justify-between mb-5">
				<h6 class="font-bold text-lg">내 밀롱가</h6>
				<a href="#new_milonga" class="text-blue-500 font-bold">만들기</a>
			</header>
            ${
                qSnap.empty
                    ? html`<p class="text-slate-500 text-sm">아직 밀롱가를 만들지 않았습니다</p>`
                    : html`
                        <ul>
                            ${
                                map(qSnap.docs, (doc) => {
                                    const data = doc.data()
                                    const milongaData = {
                                        id: doc.id,
                                        name: data.name,
                                        logoURL: data.logoURL
                                    }
                                    return html`
                                        <li class="mt-4">
                                            <a href="#milonga/${milongaData.id}" class="flex items-center">
                                                <div class="flex-0 self-start">
                                                    ${
                                                        data.logoURL
                                                            ? html`<img src="${data.logoURL}" class="size-12 rounded-xl">`
                                                            : html`<div class="size-12 bg-slate-100 rounded-xl"></div>`
                                                    }
                                                </div>
												<div class="mx-3">
													<h6 class="font-bold">${data.name}</h6>
													<dl class="inline-flex items-center flex-wrap text-sm text-slate-500">
														<dt class="me-1">${ CalendarDaysSolidIcon({ classList: 'size-3'}) }</dt>
														<dd class="inline-flex flex-wrap">
															<time class="me-1">1월 14일 수요일</time>
														</dd>
													</dl>
													<dl class="inline-flex items-center flex-wrap text-sm text-slate-500">
														<dt class="me-1">${ AtSymbolIcon({ classList: 'size-3' }) }</dt>
														<dd class="inline-flex flex-wrap">
															오초
														</dd>
													</dl>
												</div>
                                            </a>
                                        </li>
                                    `
                                })
                            }
                        </ul>`
            }
			
		</section>
	`
}