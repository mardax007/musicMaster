type UserData = {
    projects: string[];
    invites: {
        id: string;
        from: string;
    }[];
}

type Project = {
    id: string;
    name: string;
    description: string;
    createdAt: number;
    owner: string;
    collaborators: string[];
    songs: Song[];
    knownInstruments: Instrument[];
}

type Song = {
    id: string;
    name: string;
    createdAt: number;
    instruments: InstrumentUsed[];
}

type Instrument = {
    name: string;
    subnames: string[];
    id: string;
}

type InstrumentUsed = {
    name: string;
    playedBy: string;
    count: number;
    id: string;
}

type Collaborator = {
    displayName: string;
    photoURL: string;
    id: string;
}

export type { Collaborator, UserData, Project, Song, Instrument, InstrumentUsed };