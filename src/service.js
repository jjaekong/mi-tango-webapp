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

export const hasPermitToEditMilonga = (milongaData, userEmail = null) => {
	if (!userEmail) {
		return false;
	}
	if (milongaData?.createdBy === userEmail) {
		return true
	}
	if (milongaData?.createdBy?.organizers.findIndex(organizer => organizer.email === userEmail) > -1) {
		return true;
	}
	if (milongaData?.createdBy?.editors.findIndex(editor => editor === userEmail) > -1) {
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