import dotenv from "dotenv";
import { resetStore, setState } from "../store/fileStore.js";
import { buildSeed } from "./sample.js";

dotenv.config();
resetStore();
setState(buildSeed());
console.log("Seeded MailPilot demo data.");
console.log("Assistant: sarah@mailpilot.app / demo1234");
console.log("Client:    alex@northwind.co / demo1234");
console.log("Client:    maya@lumenlabs.io / demo1234");
