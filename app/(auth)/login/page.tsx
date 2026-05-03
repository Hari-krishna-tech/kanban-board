"use client";

import { signIn } from "next-auth/react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  LayoutGrid,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";

const featureCards: { label: string; value: string; Icon: LucideIcon }[] = [
  { label: "Backlog", value: "9 queued", Icon: BookOpen },
  { label: "Practicing", value: "active reps", Icon: Zap },
  { label: "Completed", value: "proof of work", Icon: CheckCircle2 },
];

export default function LoginPage() {
  return (
    <main className="app-surface min-h-screen overflow-hidden bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <section className="relative">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">
                Learning Kanban
              </p>
              <p className="text-xs text-muted-foreground">
                Designed for steady technical growth
              </p>
            </div>
          </div>

          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Plan, practice, complete
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Turn your study plan into a daily operating system.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              Prioritize topics, move work through learning and practice, and
              keep momentum visible without turning your board into clutter.
            </p>
          </div>

          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {featureCards.map(({ label, value, Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-border bg-card/72 p-4 shadow-sm backdrop-blur"
              >
                <Icon className="mb-5 h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-primary/8 blur-3xl" />
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card/86 p-6 shadow-2xl shadow-slate-950/10 backdrop-blur-xl sm:p-8">
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <LayoutGrid className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Welcome back
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Sign in to sync your board, tasks, notes, and learning
                progress.
              </p>
            </div>

            <button
              onClick={() => signIn("google", { redirectTo: "/board" })}
              className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-lg hover:shadow-slate-950/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>

            <div className="mt-8 rounded-2xl border border-border bg-muted/40 p-4">
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">
                  Today&apos;s flow
                </span>
                <span className="rounded-full bg-primary/12 px-2 py-0.5 font-medium text-primary">
                  4 columns
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {["Backlog", "Learn", "Practice", "Done"].map(
                  (item, index) => (
                    <div
                      key={item}
                      className="h-20 rounded-xl border border-border bg-background/70 p-2"
                    >
                      <div className="mb-3 h-1.5 rounded-full bg-primary/30" />
                      <div
                        className="h-2 rounded-full bg-muted-foreground/25"
                        style={{ width: `${72 - index * 10}%` }}
                      />
                      <p className="mt-5 truncate text-[10px] font-medium text-muted-foreground">
                        {item}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
