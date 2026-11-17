import bcrypt from "bcryptjs";
import { z } from "zod";
import { store } from "../store/fileStore.js";
import { signToken } from "../middleware/auth.js";
import { publicUser } from "../utils/publicUser.js";
import { id, now } from "../utils/ids.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["assistant", "client"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Check the form and try again.", errors: parsed.error.flatten() });
  const { name, email, password, role } = parsed.data;
  if (store.users().findOne({ email: email.toLowerCase() })) {
    return res.status(409).json({ message: "An account with that email already exists." });
  }
  const workspaceId = id("ws");
  const userId = id("usr");
  store.workspaces().insert({
    _id: workspaceId,
    name: `${name.split(" ")[0]}'s workspace`,
    type: role,
    ownerId: userId,
    assistantName: role === "assistant" ? name : "",
    clientName: role === "client" ? name : "",
    createdAt: now(),
  });
  const user = store.users().insert({
    _id: userId,
    name,
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    role,
    avatar: name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
    theme: "system",
    onboardingComplete: false,
    workspaceId,
    title: role === "assistant" ? "Personal Assistant" : "Client",
    createdAt: now(),
  });
  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Enter a valid email and password." });
  const user = store.users().findOne({ email: parsed.data.email.toLowerCase() });
  if (!user || !bcrypt.compareSync(parsed.data.password, user.passwordHash)) {
    return res.status(401).json({ message: "Email or password is incorrect." });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
}

export async function me(req, res) {
  res.json({ user: req.user });
}

export async function updateMe(req, res) {
  const patch = {};
  const allowed = ["name", "theme", "title", "onboardingComplete"];
  for (const k of allowed) if (req.body[k] !== undefined) patch[k] = req.body[k];
  const updated = store.users().updateById(req.user._id, patch);
  res.json({ user: publicUser(updated) });
}
