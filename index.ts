import { Octokit } from "octokit";
const octokit = new Octokit();

const { data } = await octokit.rest.repos.listBranches({
	owner: "aidansunbury",
	repo: "trpc-ui",
});

console.log(data);
