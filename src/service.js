import { getAuth } from "firebase/auth"
import { doc, getDoc, getFirestore } from "firebase/firestore"

export const getMilonga = async (milongaId = null) => {
	if (!milongaId) {
		return null
	}

	const db = getFirestore()
	const milongaRef = doc(db, `${process.env.MODE}.milongas`, milongaId)
	const milongaSnap = await getDoc(milongaRef)
	const milongaData = milongaSnap.exists()
		? { id: milongaId, ...milongaSnap.data() }
		: null
	
	return milongaData
}

// export const hasPermitToEditMilonga = async (milongaId) => {
// 	const auth = getAuth()
// 	await auth.authStateReady()
// 	const currentUser = auth.currentUser;
// 	if (!currentUser) {
// 		return false;
// 	}
// 	const db = getFirestore()
// 	const milongaRef = doc(db, `${process.env.MODE}.milongas`, milongaId)
// 	const milongaSnap = await getDoc(milongaRef)
// 	if (milongaSnap.exists()) {
// 		const milongaData = milongaSnap.data()
// 		if (milongaData?.createdBy === currentUser.email) {
// 			return true
// 		}
// 		if (milongaData?.createdBy?.organizers.findIndex(organizer => organizer.email === currentUser.email) > -1) {
// 			return true;
// 		}
// 		if (milongaData?.createdBy?.editors.findIndex(editor => editor === currentUser.email) > -1) {
// 			return true;
// 		}
// 	}
// 	return false;
// }

export const hasPermitToEditMilonga = async (milongaData) => {
	const auth = getAuth()
	await auth.authStateReady()
	const currentUser = auth.currentUser;
	if (!currentUser) {
		return false;
	}
	if (milongaData?.createdBy === currentUser.email) {
		return true
	}
	if (milongaData?.createdBy?.organizers.findIndex(organizer => organizer.email === currentUser.email) > -1) {
		return true;
	}
	if (milongaData?.createdBy?.editors.findIndex(editor => editor === currentUser.email) > -1) {
		return true;
	}
	return false;
}

export const getMilongaEvents = async (countryCode = 'KR') => {
}

export function getMilongaIdByHash() {
}

export function getMilongaIdByParams() {
}