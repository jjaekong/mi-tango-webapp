import { getDoc, getFirestore } from "firebase/firestore"

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

export const getMilongaEvents = async (countryCode = 'KR') => {
}