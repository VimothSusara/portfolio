import { Octokit } from "octokit";

export function createGithubClient() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured");
  }
  return new Octokit({ auth: token });
}

export function getGithubUsername() {
  return process.env.GITHUB_USERNAME ?? "vimothsusara";
}
