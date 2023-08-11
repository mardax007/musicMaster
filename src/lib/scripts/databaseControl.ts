import { onSnapshot, setDoc } from "firebase/firestore";
import type { UserData } from "./types";
import { user, userData } from "./stores";
import { updateProfile } from "firebase/auth";
import { getInvitesCollectionRef, getPublicDocRef, getUserDocRef, getEmailToUserDocRef } from "./documentReferences";

let existingListener1 = () => {};
let existingListener2 = () => {};

user.subscribe((userInfo) => {
    if (!userInfo) return;

    existingListener1();
    existingListener2();

    const userDocRef = getUserDocRef(userInfo?.uid);
    existingListener1 = onSnapshot(
        userDocRef,
        async (userDoc) => {
            if (!userInfo) return;

            if ((!userInfo.displayName || !userInfo.photoURL)) {
                const userName = userInfo.displayName ?? ((userInfo.email ?? "Unknown").split('@')[0]).replace(/\d+$/, '');
                const photoURL = userInfo.photoURL ?? "https://ui-avatars.com/api/?name=" + userName;

                await updateProfile(userInfo, {
                    displayName: userName,
                    photoURL: photoURL
                });
            }

            await setDoc(
                getPublicDocRef(userInfo.uid), {
                    displayName: userInfo.displayName,
                    photoURL: userInfo.photoURL,
                    id: userInfo.uid
                }
            );

            await setDoc(
                await getEmailToUserDocRef(userInfo.email ?? ""), {
                    id: userInfo.uid
                }
            );

            if (userDoc.exists()) {
                userData.update((data) => {
                    data = {
                        ...data,
                        ...userDoc.data() as UserData
                    } as unknown as UserData;
                    return data;
                });
            } else {
                setDoc(userDocRef, {});
            }
        }
    );

    existingListener2();
    existingListener2 = onSnapshot(
        getInvitesCollectionRef(userInfo.uid),
        (invitesDoc) => {
            userData.update((data) => {
                data = {
                    ...data,
                    invites: invitesDoc.docs.map((doc) => {
                        return {id: doc.id, ...doc.data()};
                    })
                } as unknown as UserData;
                return data;
            }
        );
    });
});