// lib/github.ts
export const fetchGitHubRepoContents = async (
  repoUrl: string,
  token?: string // Optional GitHub token
): Promise<
  Record<
    string,
    Record<
      string,
      { url: string; duration: string; size: number; type: string; sha: string }
    >
  >
> => {
  try {
    const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!urlMatch) {
      throw new Error("Invalid GitHub repository URL");
    }
    const [, owner, repo] = urlMatch;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          ...(token && { Authorization: `Bearer ${token}` }), // Add token if provided
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    type TreeNode = Record<
      string,
      | Record<
          string,
          {
            url: string;
            duration: string;
            size: number;
            type: string;
            sha: string;
          }
        >
      | FileNode
    >;

    type FileNode = {
      url: string;
      duration: string;
      size: number;
      type: string;
      sha: string;
    };
    const tree: TreeNode = {};

    for (const item of data.tree) {
      if (item.type === "blob") {
        const parts = item.path.split("/");
        let current = tree;

        for (let i = 0; i < parts.length - 1; i++) {
          const folder = parts[i];
          if (!current[folder]) {
            current[folder] = {};
          }
          if (typeof current[folder] !== "object" || "url" in current[folder]) {
            current[folder] = {};
          }
          current = current[folder] as TreeNode;
        }

        const fileName = parts[parts.length - 1];
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${item.path}`;
        let duration = "";

        try {
          const audio = new Audio(rawUrl);
          await new Promise<void>((resolve) => {
            audio.onloadedmetadata = () => {
              const durationSeconds = audio.duration;
              if (!isNaN(durationSeconds) && isFinite(durationSeconds)) {
                const minutes = Math.floor(durationSeconds / 60);
                const seconds = Math.floor(durationSeconds % 60)
                  .toString()
                  .padStart(2, "0");
                duration = `${minutes}:${seconds}`;
              }
              resolve();
            };
            audio.onerror = () => resolve();
          });
        } catch (e) {
          console.warn(`Could not calculate duration for ${item.path}:`, e);
        }

        const fileType = fileName.split(".").pop()?.toLowerCase() || "";

        current[fileName] = {
          url: rawUrl,
          duration: duration || "",
          size: item.size || 0,
          type: fileType || "",
          sha: item.sha || "",
        } as FileNode;
      }
    }
    return tree as Record<
      string,
      Record<
        string,
        {
          url: string;
          duration: string;
          size: number;
          type: string;
          sha: string;
        }
      >
    >;
    // return tree;
  } catch (error) {
    console.error("Error fetching GitHub repo:", error);
    throw error;
  }
};
