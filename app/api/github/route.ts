import { NextResponse } from "next/server";

const USERNAME = "Skywalker1910";
const GITHUB_API = "https://api.github.com";
const CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400";
const REQUEST_TIMEOUT_MS = 8_000;

// Keep external GitHub availability out of the deployment build. The fetches
// below still use Next.js' one-hour data cache at runtime.
export const dynamic = "force-dynamic";
export const revalidate = 3600; // cache 1 hour

function githubHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Aditya-More-Tech-Portfolio",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function requestGitHub(path: string, token?: string) {
  return fetch(`${GITHUB_API}${path}`, {
    headers: githubHeaders(token),
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

async function requestProfile(token?: string) {
  return Promise.all([
    requestGitHub(`/users/${USERNAME}`, token),
    requestGitHub(`/users/${USERNAME}/repos?per_page=100&sort=pushed`, token),
  ]);
}

function unavailableResponse() {
  return NextResponse.json(
    { error: "GitHub data is temporarily unavailable" },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  const configuredToken = process.env.GITHUB_TOKEN?.trim() || undefined;

  let userRes: Response;
  let reposRes: Response;

  try {
    [userRes, reposRes] = await requestProfile(configuredToken);

    // An expired/revoked token should not take down public profile data.
    if (configuredToken && (userRes.status === 401 || userRes.status === 403)) {
      console.warn("[github] Authenticated request failed; retrying public API", {
        status: userRes.status,
      });
      [userRes, reposRes] = await requestProfile();
    }
  } catch (error) {
    console.error("[github] Upstream request failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return unavailableResponse();
  }

  if (!userRes.ok) {
    console.error("[github] Profile request returned an error", {
      status: userRes.status,
      rateLimitRemaining: userRes.headers.get("x-ratelimit-remaining"),
      rateLimitReset: userRes.headers.get("x-ratelimit-reset"),
    });
    return unavailableResponse();
  }

  const user = await userRes.json();
  if (!reposRes.ok) {
    console.warn("[github] Repository request returned an error", {
      status: reposRes.status,
      rateLimitRemaining: reposRes.headers.get("x-ratelimit-remaining"),
    });
  }
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

  return NextResponse.json(
    {
      login: user.login,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar_url,
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      profileUrl: user.html_url,
      topRepos,
    },
    { headers: { "Cache-Control": CACHE_CONTROL } },
  );
}
