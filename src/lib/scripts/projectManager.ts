import { arrayRemove, arrayUnion, deleteDoc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import type { Collaborator, Project } from "./types";
import { generateUID } from "./util";
import { getInviteDocRef, getProjectDocRef, getSongDocRef, getUserDocRef, getEmailToUserDocRef, getPublicDocRef } from "./documentReferences";

async function createNewProject(data: {name: string; description: string;}, userId: string) {
    const project = {
        id: generateUID(),
        name: data.name,
        description: data.description,
        createdAt: Date.now(),
        owner: userId,
        collaborators: [userId]
    };

    await setDoc(getProjectDocRef(project.id), project);
    await updateDoc(getUserDocRef(userId), {projects: arrayUnion(project.id)});

    window.location.href = `/project/${project.id}`;
}

async function getProject(id: string) {
    return (await getDoc(getProjectDocRef(id))).data() as Project;
}

async function deleteSong(projectId:string, songId: string) {
    await deleteDoc(getSongDocRef(projectId, songId));
}

async function addColab(email:string, projectId: string, from: string) {
    const projectRef = getProjectDocRef(projectId);

    const userId = (await getDoc(await getEmailToUserDocRef(email))).data()?.id;
    if (!userId) return;

    await updateDoc(projectRef, {collaborators: arrayUnion(userId)});

    await setDoc(
        getInviteDocRef(userId, projectId),
        { from: from });
}

async function removeColab(projectId: string, userId: string) {
    await updateDoc(
        getProjectDocRef(projectId),
        { collaborators: arrayRemove(userId) }
    );
}

async function removeInvite(projectId: string, userId: string) {
    await deleteDoc(getInviteDocRef(userId, projectId));
}

async function acceptInvite(projectId: string, userId: string) {
    await removeInvite(projectId, userId);

    await updateDoc(
        getUserDocRef(userId),
        { projects: arrayUnion(projectId) }
    );
}

async function declineInvite(projectId: string, userId: string) {
    await removeInvite(projectId, userId);

    await updateDoc(
        getProjectDocRef(projectId),
        { collaborators: arrayRemove(userId) }
    );
}

async function getCollaboratorInfo(uid: string): Promise<Collaborator> {
    const collaboratorInfo: Collaborator = (await getDoc(getPublicDocRef(uid))).data() as Collaborator;
    return collaboratorInfo;
}

export { getCollaboratorInfo, createNewProject, getProject, deleteSong, addColab, acceptInvite, declineInvite, removeColab };