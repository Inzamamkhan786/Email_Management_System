import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Logo from "../../components/layout/Logo";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuth } from "../../store/auth";

export default function Signup() {
  const register = useAuth((s) => s.register);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "assistant",
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      navigate("/onboarding");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between border-r border-line bg-surface px-12 py-10 lg:flex">
        <Logo />
        <div className="max-w-md">
          <h1 className="text-[28px] font-semibold leading-tight">A desk for the person who keeps the founder moving.</h1>
          <p className="mt-4 text-[14px] leading-7 text-muted">
            Assistants get the full inbox. Clients only see the conversations that actually need them.
          </p>
        </div>
        <p className="text-[12px] text-muted">Role choice can be refined during onboarding.</p>
      </aside>
      <main className="flex items-center justify-center px-5 py-12">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h2 className="text-[22px] font-semibold">Create your account</h2>
          <Input label="Full name" value={form.name} onChange={set("name")} required />
          <Input label="Work email" type="email" value={form.email} onChange={set("email")} required />
          <Input label="Password" type="password" value={form.password} onChange={set("password")} required />
          <Input label="Confirm password" type="password" value={form.confirm} onChange={set("confirm")} required />
          <fieldset>
            <legend className="mb-1.5 text-[12px] font-medium">Role</legend>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "assistant", label: "Personal Assistant" },
                { id: "client", label: "Client" },
              ].map((r) => (
                <label
                  key={r.id}
                  className={`cursor-pointer rounded-md border px-3 py-2 text-[13px] ${
                    form.role === r.id ? "border-accent" : "border-line"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    className="mr-2"
                    checked={form.role === r.id}
                    onChange={() => setForm({ ...form, role: r.id })}
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </fieldset>
          <Button className="w-full" size="lg" loading={loading}>
            Create account
          </Button>
          <p className="text-[13px] text-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-ink">
              Sign in
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
