import { collection, doc, getFirestore } from "firebase/firestore";
import { hashEmail } from "./util";

async function getEmailToUserDocRef(email: string) {
    return doc(getFirestore(), "userEmailConverter", await hashEmail(email));
}

function getPublicDocRef(uid: string) {
    return doc(getFirestore(), "public", uid);
}

function getUserDocRef(uid: string) {
    return doc(getFirestore(), "users", uid);
}

function getProjectDocRef(projectId: string) {
    return doc(getFirestore(), "projects", projectId);
}

function getSongsCollectionRef(projectId: string) {
    return collection(getFirestore(), "projects", projectId, "songs");
}

function getSongDocRef(projectId: string, songId: string) {
    return doc(getFirestore(), "projects", projectId, "songs", songId);
}

function getSongInstrumentsCollectionRef(projectId: string, songId: string) {
    return collection(getFirestore(), "projects", projectId, "songs", songId, "instruments");
}

function getSongInstrumentDocRef(projectId: string, songId: string, instrumentId: string) {
    return doc(getFirestore(), "projects", projectId, "songs", songId, "instruments", instrumentId);
}

function getKnownInstrumentsCollectionRef(projectId: string) {
    return collection(getFirestore(), "projects", projectId, "knownInstruments");
}

function getKnownInstrumentDocRef(projectId: string, instrumentId: string) {
    return doc(getFirestore(), "projects", projectId, "knownInstruments", instrumentId);
}

function getInvitesCollectionRef(uid: string) {
    return collection(getFirestore(), "users", uid, "invites");
}

function getInviteDocRef(uid: string, inviteId: string) {
    return doc(getFirestore(), "users", uid, "invites", inviteId);
}

export {
    getEmailToUserDocRef,
    getPublicDocRef,
    getUserDocRef,
    getProjectDocRef,
    getSongsCollectionRef,
    getSongDocRef,
    getSongInstrumentsCollectionRef,
    getSongInstrumentDocRef,
    getKnownInstrumentsCollectionRef,
    getKnownInstrumentDocRef,
    getInvitesCollectionRef,
    getInviteDocRef
};