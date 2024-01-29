import { getAuth } from 'firebase/auth'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { render, html } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'
import { ENV } from './config'

export const Milonga = async () => {

	// const auth = getAuth()

	// await auth.authStateReady()

    const milongaId = location.hash.split('/')[1]

    console.log('milonga id ', milongaId)

    const db = getFirestore()
    const milongaRef = doc(db, `${ENV}.milongas`, milongaId)
    const milongaSnap = await getDoc(milongaRef)

    if (!milongaSnap.exists()) {
        location.replace('#')
    }

    const milongaData = milongaSnap.data()

	render(cache(html`
		${milongaData.name}
	`), document.getElementById('app'))
}