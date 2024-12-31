import { describe, expect, it } from "vitest";
import {
  parseGithubUrl,
  getRawContentUrl,
  checkMarkdownCharacteristics,
} from "../utils";

describe("Markdown tests", () => {
  it("Check Markdown Characteristics", async () => {
    const parsedUrl = await parseGithubUrl();
    if (parsedUrl === null) {
      throw new Error("Unable to parse GitHub URL, please add it to repo.txt");
    }
    const markdown = await (
      await fetch(
        getRawContentUrl(parsedUrl.owner, parsedUrl.repo, "README.md"),
      )
    ).text();

    const result = checkMarkdownCharacteristics(markdown);
    const failures: string[] = [];
    if (!result.hasH1Header) failures.push("Missing H1 header");
    if (!result.hasItalics) failures.push("Missing italics text");
    if (!result.hasBold) failures.push("Missing bold text");
    if (!result.hasImage) failures.push("Missing image");
    if (!result.hasCodeBlock) failures.push("Missing code block");
    if (!result.hasLink) failures.push("Missing link");

    // Assert that all characteristics are met
    expect(failures).toEqual([]);
  });
});
