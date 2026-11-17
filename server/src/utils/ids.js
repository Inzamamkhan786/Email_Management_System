import { randomUUID } from "crypto";

export const id = (prefix) => `${prefix}_${randomUUID().slice(0, 8)}`;
export const now = () => new Date().toISOString();
