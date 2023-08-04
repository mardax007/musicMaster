import { addDoc, collection, doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import type { Project } from "./types";
import { generateUID } from "./util";

const db = getFirestore();

async function createNewProject(data: {name: string; description: string;}, user: string) {
    const project: Project = {
        id: generateUID(),
        name: data.name,
        description: data.description,
        createdAt: Date.now(),
        createdBy: user,
        collaborators: [user],
        songs: [],
        knownInstruments: []
    }

    const projectRef = doc(db, "projects", project.id);
    await setDoc(projectRef, project);

    const userRef = collection(db, "users", user, "projects");
    await addDoc(userRef, {id: project.id});

    window.location.href = `/project/${project.id}`;
}

async function getProject(id: string) {
    const projectRef = doc(db, "projects", id);
    const data = (await getDoc(projectRef)).data() as Project
    return data;
}

async function createNewSong(projectId: string, songName: string) {
    const songId = generateUID();
    const projectRef = doc(db, "projects", projectId);

    const songRef = collection(projectRef, "songs", songId);
}

export { createNewProject, getProject, createNewSong }