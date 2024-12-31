import fs from "node:fs";

// Given a url like this https://github.com/CS61D/Assignment-Solution-Git
// Read from repo.txt
// Return the owner and repo name
export const parseGithubUrl = async (): Promise<{
  owner: string;
  repo: string;
} | null> => {
  try {
    // Read the URL from repo.txt
    const url = await fs.promises.readFile("repo.txt", "utf-8");
    const trimmedUrl = url.trim();

    // Parse the URL
    const match = trimmedUrl.match(
      /^https?:\/\/github\.com\/([^/]+)\/([^/]+)$/,
    );
    if (match) {
      const [, owner, repo] = match;
      return { owner, repo };
    }
    throw new Error("Invalid GitHub URL format.");
  } catch (error) {
    return null;
  }
};

export const getRawContentUrl = (owner: string, repo: string, path: string) =>
  `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;

type MarkdownCheckResult = {
  hasH1Header: boolean;
  hasItalics: boolean;
  hasBold: boolean;
  hasImage: boolean;
  hasCodeBlock: boolean;
  hasLink: boolean;
};

export function checkMarkdownCharacteristics(
  markdown: string,
): MarkdownCheckResult {
  return {
    hasH1Header: /^#\s.+/m.test(markdown), // Matches lines starting with # followed by a space
    hasItalics: /(\*|_).+?\1/.test(markdown), // Matches *text* or _text_
    hasBold: /(\*\*|__).+?\1/.test(markdown), // Matches **text** or __text__
    hasImage: /!\[.*?\]\(.*?\)/.test(markdown), // Matches ![alt](url)
    hasCodeBlock: /```[\s\S]*?```/.test(markdown), // Matches ```code```
    hasLink: /\[.*?\]\(.*?\)/.test(markdown), // Matches [text](url)
  };
}

type CommandCheckResult = {
  success: boolean;
  missing: string[];
};

/**
 * Parses the bash history and returns an array of commands used.
 * @param history The bash history as a string.
 */
function parseBashHistory(history: string): string[] {
  return history
    .split("\n") // Split into lines
    .map((line) => line.trim().replace(/^\d+\s+/, "")) // Remove line numbers
    .filter((line) => line.length > 0); // Remove empty lines
}

/**
 * Checks the required bash commands in the history.
 * @param history The bash history as a string.
 */
export function checkBashCommands(history: string): CommandCheckResult {
  const requiredCommands = ["ls", "echo", "cd", "pwd", "mkdir", "touch"];
  const eitherCommands = ["mv", "rm"];

  const commandsUsed = parseBashHistory(history);

  const missingCommands = requiredCommands.filter(
    (cmd) => !commandsUsed.some((line) => line.startsWith(cmd)),
  );

  const eitherCommandUsed = eitherCommands.some((cmd) =>
    commandsUsed.some((line) => line.startsWith(cmd)),
  );
  if (!eitherCommandUsed) {
    missingCommands.push(`One of: ${eitherCommands.join(", ")}`);
  }

  return {
    success: missingCommands.length === 0,
    missing: missingCommands,
  };
}

/**
 * Checks the required git commands in the history.
 * @param history The bash history as a string.
 */
export function checkGitCommands(history: string): CommandCheckResult {
  const requiredGitCommands = [
    "git init",
    "git status",
    "git log",
    "git add",
    "git commit",
    "git checkout",
    "git branch",
    "git merge",
    "git push",
    "git pull",
  ];
  // No explicit check for creating a branch, but it is implied by the other commands

  const deleteBranchCommands = [
    /git branch -D \S+/,
    /git branch -d \S+/,
    /git branch --delete \S+/,
  ];

  const commandsUsed = parseBashHistory(history);

  // Check for missing required Git commands
  const missingGitCommands = requiredGitCommands.filter(
    (cmd) => !commandsUsed.some((line) => line.startsWith(cmd)),
  );

  // Ensure a branch was deleted using "git branch -D", "git branch -d", or "git branch --delete"
  const branchDeletionUsed = deleteBranchCommands.some((pattern) =>
    commandsUsed.some((line) => pattern.test(line)),
  );

  // Add a specific error for missing branch deletion commands
  if (!branchDeletionUsed) {
    missingGitCommands.push(
      "git branch -D <branch>, git branch -d <branch>, or git branch --delete <branch>",
    );
  }

  return {
    success: missingGitCommands.length === 0,
    missing: missingGitCommands,
  };
}
