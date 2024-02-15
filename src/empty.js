import { collection, getDocs, getFirestore, query, where } from "firebase/firestore"
import { html, nothing, render } from "lit-html"
import { debounce } from "lodash-es"

export const Empty = async () => {
	console.log('empty page')

	

	async function searchDD(e) {
		console.log('search', e.target.value)
		if (!e.target.value) return 
		render(nothing, document.getElementById('list'))
		const keyword = e.target.value.split('')
		console.log('keyword', keyword)
		const db = getFirestore()
		const q = query(
			collection(db, `${process.env.MODE}.djs`),
			where('nameArray', 'array-contains-any', keyword)
		)
		const snap = await getDocs(q)
		if (snap.empty) {
			render(nothing, document.getElementById('list'))
		} else {
			render(html`${
				snap.docs.map(doc => {
					const data = {
						id: doc.id,
						...doc.data()
					}
					return html`<option value="${data.name}">${data.nationality}</option>`
				})
			}`, document.getElementById('list'))
		}
		
	}

	render(html`
		<form>
			<input type="search" list="list" @input=${debounce(searchDD, 500)}>
			<datalist id="list" @select=${e => { console.log(e) }}></datalist>
		</form>
	`, document.getElementById('app'))
}