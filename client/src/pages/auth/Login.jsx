import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Logo from "../../components/layout/Logo";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuth } from "../../store/auth";

export default function Login() {
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState("sarah@mailpilot.app");
  const [password, setPassword] = useState("demo1234");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      navigate(user.role === "client" ? "/c" : "/app/overview");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between border-r border-line bg-surface px-12 py-10 lg:flex">
        <Logo />
        <div className="max-w-md">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted">For executive desks</p>
          <h1 className="mt-3 text-[28px] font-semibold leading-tight">
            Know who should reply before you open the thread.
          </h1>
          <p className="mt-4 text-[14px] leading-7 text-muted">
            MailPilot watches connected inboxes, classifies responsibility, and gives clients a quiet list of the few
            decisions only they can make.
          </p>
        </div>
        <p className="text-[12px] text-muted">Demo · Gmail and Outlook connections are simulated.</p>
      </aside>
      <main className="flex items-center justify-center px-5 py-12">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div>
            <h2 className="text-[22px] font-semibold">Sign in</h2>
            <p className="mt-1 text-[13px] text-muted">Use a demo account or the credentials you created.</p>
          </div>
          <Input label="Work email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div className="relative">
            <Input
              label="Password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-8 rounded p-1 text-muted"
              onClick={() => setShow((v) => !v)}
              aria-label="Show password"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <label className="flex items-center gap-2 text-muted">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <Link to="/login" className="text-muted hover:text-ink">
              Forgot password
            </Link>
          </div>
          <Button className="w-full" size="lg" loading={loading}>
            Sign in
          </Button>
          <button
            type="button"
            className="h-11 w-full rounded-md border border-line text-[13px] font-medium hover:bg-quiet"
            onClick={() => toast("Google sign-in is not configured in this prototype.")}
          >
            Continue with Google
          </button>
          <p className="text-[13px] text-muted">
            New to MailPilot?{" "}
            <Link to="/signup" className="font-medium text-ink">
              Create an account
            </Link>
          </p>
          <div className="border-t border-line pt-3 text-[11px] leading-5 text-muted">
            Assistant: sarah@mailpilot.app / demo1234
            <br />
            Client: alex@northwind.co / demo1234
          </div>
        </form>
      </main>
    </div>
  );
}
