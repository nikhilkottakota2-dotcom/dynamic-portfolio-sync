import { queryOptions } from "@tanstack/react-query";

export type GitHubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  blog: string | null;
  location: string | null;
  company: string | null;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
};

export type GitHubRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  fork: boolean;
  updated_at: string;
};

const API = "https://api.github.com";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) {
    throw new Error(
      res.status === 404
        ? "GitHub profile not found."
        : `GitHub request failed (${res.status}).`,
    );
  }
  return (await res.json()) as T;
}

export const userQuery = (login: string) =>
  queryOptions({
    queryKey: ["gh-user", login],
    queryFn: () => get<GitHubUser>(`/users/${login}`),
    staleTime: 5 * 60_000,
  });

export const reposQuery = (login: string) =>
  queryOptions({
    queryKey: ["gh-repos", login],
    queryFn: () =>
      get<GitHubRepo[]>(`/users/${login}/repos?per_page=100&sort=updated`),
    staleTime: 5 * 60_000,
  });
