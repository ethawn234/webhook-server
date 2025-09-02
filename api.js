import { Octokit } from "octokit";
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.COPILOT_DEMO;

// async function auth() {
//   try {
//     return await octokit.request("GET /user", {
//       headers: {
//         "X-GitHub-Api-Version": "2022-11-28"
//       }
//     })
//   } catch (error) {
//     console.error(`ERROR authenticating to GitHub: ${error}`);
//     throw error;
//   }
// }
// auth to GitHub
const octokit = new Octokit({
  auth: token
});
// create issue for alert
export default async function createIssue (owner, repo, title, body) {
  return await octokit.request('POST /repos/{owner}/{repo}/issues', {
    owner, // required
    repo, // required
    title, // required
    body,
    assignees: [
      'copilot'
    ],
    milestone: 1,
    labels: [
      'security'
    ],
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
}
