import { writable } from "svelte/store";
import type { ExistingInstrument, Song } from "./types";

const existingInstruments = writable<ExistingInstrument[]>([]);
const songs = writable<Song[]>([]);
const newSong = writable<Song | null>(null);
const instruments = writable<any[]>([]);
const projectID = writable<string>("");
const projects = writable<any[]>([]);
const players = writable<any[]>([]);
const userInfo = writable<any>({});

export { existingInstruments, songs, newSong, instruments, projectID, userInfo, projects, players };