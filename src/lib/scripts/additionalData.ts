import { doc, getDoc, getFirestore } from "firebase/firestore";
import type { Collaborator } from "./types";

const db = getFirestore();

async function getCollaboratorInfo(uid: string): Promise<Collaborator> {
    const collaboratorRef = doc(db, "public", uid);
    const collaboratorInfo: Collaborator = (await getDoc(collaboratorRef)).data() as Collaborator;
    return collaboratorInfo;
}

export { getCollaboratorInfo }