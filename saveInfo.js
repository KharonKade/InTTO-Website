import { db } from "./api.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

export async function saveApplication(data) {
    try {
        const collectionRef = collection(db, "incubation_applications");
        const docRef = await addDoc(collectionRef, {
            ...data,
            submittedAt: serverTimestamp()
        });
        console.log("Document successfully written with ID:", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document:", e);
        throw e;
    }
}