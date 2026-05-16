import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { api, unwrap } from "../lib/api";
import { loginSchema, signupSchema } from "../lib/schemas";
import { useAuthStore } from "../store/auth";
import { User } from "../types/domain";

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const schema = mode === "login" ? loginSchema : signupSchema;
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "", ...(mode === "signup" ? { name: "" } : {}) } });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError("");
    try {
      const data = await unwrap<{ token: string; user: User }>(api.post(`/api/auth/${mode}`, values));
      setAuth(data.user, data.token);
      navigate("/dashboard");
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Authentication failed");
    }
  });

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_center,#4f46e540,transparent_35%),var(--bg-base)] p-4">
      <form onSubmit={onSubmit} className={`glass w-full max-w-md rounded-xl p-6 ${serverError ? "animate-[shake_.25s]" : ""}`}>
        <style>{`@keyframes shake{25%{transform:translateX(-5px)}50%{transform:translateX(5px)}75%{transform:translateX(-3px)}}`}</style>
        <h1 className="text-3xl font-bold">{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{mode === "login" ? "Sign in to your workspace." : "Start managing projects with your team."}</p>
        <div className="mt-6 space-y-4">
          {mode === "signup" && <Field label="Name" error={(form.formState.errors as any).name?.message}><input className="input" {...form.register("name" as never)} /></Field>}
          <Field label="Email" error={form.formState.errors.email?.message}><input className="input" type="email" {...form.register("email")} /></Field>
          <Field label="Password" error={form.formState.errors.password?.message}>
            <div className="relative">
              <input className="input pr-11" type={showPassword ? "text" : "password"} {...form.register("password")} />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[color:var(--text-secondary)]" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
        </div>
        {serverError ? <p className="mt-4 text-sm text-red-300">{serverError}</p> : null}
        <button className="btn mt-6 w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
          {form.formState.isSubmitting ? (mode === "login" ? "Logging in..." : "Creating account...") : mode === "login" ? "Login" : "Sign up"}
        </button>
        <p className="mt-5 text-center text-sm text-[color:var(--text-secondary)]">
          {mode === "login" ? "Need an account? " : "Already registered? "}
          <Link className="font-semibold text-indigo-300" to={mode === "login" ? "/signup" : "/login"}>{mode === "login" ? "Sign up" : "Login"}</Link>
        </p>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium">{label}<div className="mt-2">{children}</div>{error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}</label>;
}
