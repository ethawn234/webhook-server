import { Octokit } from "octokit";
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.COPILOT_DEMO;
// auth to GitHub
const octokit = new Octokit({
  auth: token
});
// create issue for alert
export default async function createIssue (owner, repo, title, body) {
  try {
    const response = await octokit.request('POST /repos/{owner}/{repo}/issues', {
      owner, // required
      repo, // required
      title, // required
      body,
      labels: [
        'security',
        'vulnerability'
      ],
      assignees: [
        'copilot-swe-agent[bot]'
      ],
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    
    console.log(`Successfully created issue #${response.data.number}: ${response.data.title}`);
    return response.data;
  } catch (error) {
    console.error('Error creating GitHub issue:', error.message);
    if (error.response) {
      console.error('GitHub API response:', error.response.data);
    }
    throw error;
  }
}
