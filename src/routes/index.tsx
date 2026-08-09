import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { userQuery, reposQuery, type GitHubRepo } from "@/lib/github";

const LOGIN = "nikhilkottakota2-dotcom";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nikhil Kottakota — Developer Portfolio" },
      {
        name: "description",
        content:
          "Flat, bold developer portfolio that stays in sync with Nikhil Kottakota's live GitHub profile, repositories and activity.",
      },
      { property: "og:title", content: "Nikhil Kottakota — Developer Portfolio" },
      {
        property: "og:description",
        content:
          "A live portfolio powered by GitHub: projects, languages and stats update automatically.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portfolio,
  errorComponent: ({ error }) => (
    <Shell>
      <div className="glass p-8">
        <h1 className="text-3xl">Something broke</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    </Shell>
  ),
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-6xl px-5 py-14 md:px-8">{children}</main>
  );
}

function Marquee({ words }: { words: string[] }) {
  const line = words.length ? words : ["code", "build", "ship"];
  return (
    <div className="overflow-hidden border-y border-white/15 bg-white/5 py-3 backdrop-blur-xl">
      <div className="marquee-track flex w-max gap-8 whitespace-nowrap">
        {[0, 1].map((k) => (
          <div key={k} className="flex gap-8">
            {line.map((w) => (
              <span
                key={`${k}-${w}`}
                className="font-display text-lg uppercase tracking-tight text-foreground/80"
              >
                {w} ✦
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="glass p-5">
      <div className="font-display text-4xl">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function RepoCard({ repo }: { repo: GitHubRepo }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noreferrer noopener"
      className="glass glass-hover flex flex-col p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl leading-tight break-words">{repo.name}</h3>
        <span className="shrink-0 rounded-full bg-highlight/90 px-3 py-1 text-xs font-bold text-highlight-foreground">
          ★ {repo.stargazers_count}
        </span>
      </div>
      <p className="mt-3 flex-1 text-sm text-muted-foreground">
        {repo.description ?? "No description yet."}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider">
        {repo.language && (
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">{repo.language}</span>
        )}
        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
          {new Date(repo.updated_at).toLocaleDateString(undefined, {
            month: "short",
            year: "numeric",
          })}
        </span>
        {repo.homepage && (
          <span className="rounded-full bg-secondary/80 px-3 py-1 text-secondary-foreground">live</span>
        )}
      </div>
    </a>
  );
}

function Content() {
  const { data: user } = useSuspenseQuery(userQuery(LOGIN));
  const { data: allRepos } = useSuspenseQuery(reposQuery(LOGIN));

  const repos = allRepos
    .filter((r) => !r.fork)
    .sort(
      (a, b) =>
        b.stargazers_count - a.stargazers_count ||
        +new Date(b.updated_at) - +new Date(a.updated_at),
    );

  const languages = Array.from(
    repos.reduce((m, r) => {
      if (r.language) m.set(r.language, (m.get(r.language) ?? 0) + 1);
      return m;
    }, new Map<string, number>()),
  ).sort((a, b) => b[1] - a[1]);

  const stars = repos.reduce((n, r) => n + r.stargazers_count, 0);
  const displayName = user.name ?? "Nikhil Kottakota";

  return (
    <>
      <Shell>
        <header className="flex flex-wrap items-center justify-between gap-4 glass px-5 py-4">
          <span className="font-display text-lg">{displayName}</span>
          <nav className="flex gap-5 text-sm font-bold uppercase tracking-wider">
            <a href="#work" className="hover:text-primary">
              Work
            </a>
            <a href="#stack" className="hover:text-primary">
              Stack
            </a>
            <a
              href={user.html_url}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-primary"
            >
              GitHub
            </a>
          </nav>
        </header>

        <section className="grid gap-8 pt-12 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <p className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-foreground backdrop-blur-md">
              Live from GitHub
            </p>
            <h1 className="mt-5 text-5xl leading-[0.95] md:text-7xl">
              {displayName}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              {user.bio ??
                "Developer building things in public. Every project below is pulled straight from my GitHub account."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold uppercase tracking-wider">
              <a
                href={user.html_url}
                target="_blank"
                rel="noreferrer noopener"
                className="glass-primary glass-hover px-5 py-3"
              >
                @{user.login}
              </a>
              {user.blog && (
                <a
                  href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="glass glass-hover px-5 py-3"
                >
                  Website
                </a>
              )}
            </div>
          </div>
          <div className="glass p-3">
            <img
              src={user.avatar_url}
              alt={`${displayName}'s GitHub avatar`}
              width={480}
              height={480}
              loading="lazy"
              className="w-full rounded-[calc(var(--radius)-0.35rem)]"
            />
          </div>
        </section>

        <section className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4">
          <Stat label="Repositories" value={user.public_repos} />
          <Stat label="Total stars" value={stars} />
          <Stat label="Followers" value={user.followers} />
          <Stat
            label="Building since"
            value={new Date(user.created_at).getFullYear()}
          />
        </section>
      </Shell>

      <Marquee words={languages.map(([l]) => l)} />

      <Shell>
        <section id="work">
          <h2 className="text-3xl md:text-5xl">Projects</h2>
          <p className="mt-2 text-muted-foreground">
            {repos.length} public repositories, sorted by stars and recency.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {repos.map((r) => (
              <RepoCard key={r.id} repo={r} />
            ))}
            {repos.length === 0 && (
              <div className="glass p-6 text-muted-foreground">
                No public repositories yet — they'll appear here automatically.
              </div>
            )}
          </div>
        </section>

        <section id="stack" className="mt-16">
          <h2 className="text-3xl md:text-5xl">Stack</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {languages.map(([lang, count]) => (
              <span
                key={lang}
                className="glass px-4 py-2 text-sm font-bold uppercase tracking-wider"
              >
                {lang}
                <span className="ml-2 text-muted-foreground">{count}</span>
              </span>
            ))}
            {languages.length === 0 && (
              <span className="text-muted-foreground">
                Languages appear once repositories are published.
              </span>
            )}
          </div>
        </section>

        <footer className="mt-16 border-t border-white/15 pt-6 text-sm text-muted-foreground">
          Auto-synced with{" "}
          <a
            className="font-bold text-foreground underline"
            href={user.html_url}
            target="_blank"
            rel="noreferrer noopener"
          >
            github.com/{user.login}
          </a>
          {user.location ? ` · ${user.location}` : ""}
        </footer>
      </Shell>
    </>
  );
}

function Portfolio() {
  return (
    <Suspense
      fallback={
        <Shell>
          <div className="glass p-8 font-display text-xl">Loading GitHub…</div>
        </Shell>
      }
    >
      <Content />
    </Suspense>
  );
}
