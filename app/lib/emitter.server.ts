import { EventEmitter } from "node:events";

export const emitter = new EventEmitter({ captureRejections: true });

export const EVENTS = {
    TRANSACTION_CHANGE: (uuid: string) => {
        emitter.emit("/");
        emitter.emit(`transaction_${uuid}`);
    },
    TRANSACTION_PING: (uuid: string) => {
        emitter.emit("/");
        emitter.emit(`/tes2`);
    },
};