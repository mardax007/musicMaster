type UserData = {
    projects: Project[];
}

type Project = {
    id: string;
    name: string;
    description: string;
    createdAt: number;
    createdBy: string;
    collaborators: string[];
    songs: Song[];
    knownInstruments: Instrument[];
}

type Song = {
    id: string;
    name: string;
    createdAt: number;
    createdBy: string;
    instruments: Instrument[];
}

type Instrument = {
    name: string;
    types: string[];
}

type Collaborator = {
    displayName: string;
    photoURL: string;
}

export type { Collaborator, UserData, Project, Song, Instrument };