import { updateExistingInstruments } from "./databaseControl";
import { generateUID } from "./util";
import { existingInstruments } from "./stores";

let $existingInstruments = [] as ExistingInstrument[];

existingInstruments.subscribe((value) => $existingInstruments = value);

type ExistingInstrument = {
    mainName: string;
    names: string[];
    uid: string;
}

type Instrument = {
    name: string;
    count: number;
    uid: string;
}

class Song {
    name: string;
    instruments: Instrument[] = [];
    uid: string;
    constructor(name: string) {
        this.name = name;
        this.uid = generateUID();
    }

    async addInstrument(instrument: string) {
        const existingInstrument = $existingInstruments.find((i) => i.names.includes(instrument));

        if (!existingInstrument) {
            updateExistingInstruments(instrument);
        }

        const mainName = existingInstrument ? existingInstrument.mainName : instrument;

        const existingInstrumentIndex = this.instruments.findIndex((i) => i.name === mainName);
        if (existingInstrumentIndex !== -1) {
            this.instruments[existingInstrumentIndex].count++;
        } else {
            this.instruments.push({
                name: mainName,
                count: 1,
                uid: ""
            });
        }

        return this.instruments;
    }
}

export { type ExistingInstrument, type  Instrument, Song };