import { db } from "../Contact-Us-DB/apiC.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

export async function saveApplication(data) {
    try {
        const collectionRef = collection(db, "Contact-us Messages");
        const docRef = await addDoc(collectionRef, {
            ...data,
            submittedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding document:", e);
        throw e;
    }
}