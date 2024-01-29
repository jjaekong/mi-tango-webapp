import { collection, getDocs, getFirestore, query, where } from "firebase/firestore"
import { html, nothing } from "lit-html"
import { map } from 'lit-html/directives/map.js'
import { until } from 'lit-html/directives/until.js'
import { ENV } from "../../config"

export const MyMilongas = async (currentUser) => {

	const db = getFirestore()
	const q = query(collection(db, `${ENV}.milongas`), where('createdBy', '==', currentUser.uid))
	const qSnap = await getDocs(q)

	qSnap.forEach((doc) => {
		console.log(doc.id, " => ", doc.data());
	});

	return html`
		<section class="mb-4 bg-white p-5 rounded-xl shadow-xl shadow-slate-100">
			<header class="mb-4 flex items-center flex-wrap justify-between">
				<h6 class="font-bold text-lg">내 밀롱가</h6>
                ${
                    qSnap.empty
                        ? nothing
                        : html`<a href="#me/new_milonga" class="font-bold text-blue-500">밀롱가 만들기</a>`
                }
			</header>
            ${
                qSnap.empty
                    ? html`<p>아직 밀롱가를 만들지 않았습니다</p>`
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
                                        <li class="mt-3">
                                            <a href="#milonga/${milongaData.id}" class="flex items-center">
                                                <div class="flex-0 self-start">
                                                    ${
                                                        data.logoURL
                                                            ? html`<img src="${data.logoURL}" class="size-12 rounded-xl">`
                                                            : html`<div class="size-12 bg-slate-100 rounded-xl"></div>`
                                                    }
                                                </div>
                                                <div class="mx-3">
                                                    <span class="font-bold">${data.name}</span>
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