import { EventEmitter } from "node:events";
import { remember } from "@epic-web/remember";

export const emitter = remember("emitter", () => new EventEmitter());