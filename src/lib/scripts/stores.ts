import { writable } from "svelte/store";
import type { User } from "firebase/auth";
import type { Project, Song, UserData } from "./types";


const user = writable<null | User>(null);
const userData = writable<null | UserData>(null);

const openProject = writable<null | Project>(null);
const openSong = writable<null | Song>(null);

export { user, userData, openProject, openSong };