import { NextResponse } from "next/server";

const USERNAME = "Skywalker1910";
const GITHUB_API = "https://api.github.com";

export const dynamic = "force-static";
export const revalidate = 3600; // cache 1 hour

export async function GET() {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const [userRes, reposRes] = await Promise.all([
    fetch(`${GITHUB_API}/users/${USERNAME}`, { headers, next: { revalidate: 3600 } }),
    fetch(`${GITHUB_API}/users/${USERNAME}/repos?per_page=100&sort=pushed`, { headers, next: { revalidate: 3600 } }),
  ]);

  if (!userRes.ok) {
    return NextResponse.json({ error: "GitHub API error" }, { status: userRes.status });
  }

  const user = await userRes.json();
  const repos = reposRes.ok ? await reposRes.json() : [];

  // Top 4 repos by stars (exclude forks)
  const topRepos = (Array.isArray(repos) ? repos : [])
    .filter((r: { fork: boolean }) => !r.fork)
    .sort((a: { stargazers_count: number }, b: { stargazers_count: number }) => b.stargazers_count - a.stargazers_count)
    .slice(0, 4)
    .map((r: {
      name: string;
      description: string | null;
      html_url: string;
      stargazers_count: number;
      forks_count: number;
      language: string | null;
    }) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
    }));

  return NextResponse.json({
    login: user.login,
    name: user.name,
    bio: user.bio,
    avatar: user.avatar_url,
    followers: user.followers,
    following: user.following,
    publicRepos: user.public_repos,
    profileUrl: user.html_url,
    topRepos,
  });
}
