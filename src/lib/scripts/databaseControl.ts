import { doc, getDoc, getFirestore, onSnapshot, setDoc } from "firebase/firestore";
import type { UserData } from "./types";
import { user, userData } from "./stores";
import { updateProfile } from "firebase/auth";

const db = getFirestore();

let existingListener1 = () => {};
let existingListener2 = () => {};

user.subscribe((userInfo) => {
    if (!userInfo) return

    existingListener1();

    const userRef = doc(db, "users", userInfo?.uid);
    existingListener1 = onSnapshot(userRef, async (snapshot) => {
        if (user && !userInfo.displayName) {
            await updateProfile(userInfo, {
                displayName: ((userInfo.email ?? "Unknown").split('@')[0]).replace(/\d+$/, '')
            })
        }

        const publicInfoRef = doc(db, "public", userInfo?.uid);
        const publicInfo = await getDoc(publicInfoRef);

        if (!publicInfo.exists()) {
            await setDoc(publicInfoRef, {
                displayName: userInfo.displayName,
                photoURL: userInfo.photoURL,
            })
        }

        if (snapshot.exists()) {
            userData.set(snapshot.data() as UserData);
        } else {
            setDoc(userRef, {});
        }
    })

    existingListener2();
})