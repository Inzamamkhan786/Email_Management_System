import { store } from "../store/fileStore.js";
import { id, now } from "./ids.js";

export function logActivity(entry) {
  return store.activities().insert({
    _id: id("act"),
    at: now(),
    ...entry,
  });
}

export function notify(entry) {
  return store.notifications().insert({
    _id: id("ntf"),
    read: false,
    at: now(),
    ...entry,
  });
}
