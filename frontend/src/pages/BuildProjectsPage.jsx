import { useState, useEffect } from "react";

const API_BASE = "http://localhost:8000";

export default function BuildProjectsPage() {
  const [difficulty, setDifficulty] = useState("beginner");

  const [q, setQ] = useState("");
  const [currentLang, setCurrentLang] = useState("JavaScript");

  const [repos, setRepos] = useState([]);
  const [summary, setSummary] = useState("");
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // AI Suggestions
  const [suggestedProjects, setSuggestedProjects] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // Modal
  const [selectedProject, setSelectedProject] = useState(null);

  // AUTO FETCH AI SUGGESTIONS
  useEffect(() => {
    fetchAISuggestions();
  }, [currentLang, difficulty]);

  async function fetchAISuggestions() {
    try {
      setSuggestionsLoading(true);

      const res = await fetch(
        `${API_BASE}/api/projects/ai-suggestions?skill=${encodeURIComponent(
          currentLang
        )}&difficulty=${difficulty}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch AI suggestions");
      }

      const data = await res.json();

      setSuggestedProjects(data.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSuggestionsLoading(false);
    }
  }

  async function doSearch() {
    if (!q.trim()) return;

    try {
      setLoading(true);
      setError("");

      // SEARCH API
      const res = await fetch(
        `${API_BASE}/api/projects/search?q=${encodeURIComponent(
          q
        )}&language=${encodeURIComponent(
          currentLang
        )}&difficulty=${difficulty}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await res.json();

      setRepos(data.repos || []);
      setTotal(data.total || 0);

      // REPO LIST
      const repoList = (data.repos || [])
        .map((r) => r.full_name)
        .join(",");

      // AI SUMMARY
      const summaryRes = await fetch(
        `${API_BASE}/api/projects/ai-summary?query=${encodeURIComponent(
          q
        )}&repos=${encodeURIComponent(
          repoList
        )}&difficulty=${difficulty}`
      );

      if (!summaryRes.ok) {
        throw new Error("Failed to generate AI summary");
      }

      const summaryData = await summaryRes.json();

      setSummary(summaryData.text || "");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-6">
        Build Open Source Projects
      </h1>

      {/* SEARCH BAR */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search project ideas..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 outline-none"
        />

        <select
          value={currentLang}
          onChange={(e) => setCurrentLang(e.target.value)}
          className="px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700"
        >
          <option>JavaScript</option>
          <option>Python</option>
          <option>Java</option>
          <option>TypeScript</option>
          <option>Go</option>
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <button
          onClick={doSearch}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500"
        >
          Search
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="text-zinc-400 mb-6">
          Loading projects...
        </div>
      )}

      {/* AI SUGGESTIONS */}
      {repos.length === 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">
            🤖 AI Suggested Projects
          </h2>

          {suggestionsLoading ? (
            <div className="text-zinc-400">
              Generating AI suggestions...
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {suggestedProjects.map((project, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedProject(project)}
                  className="bg-zinc-900 border border-zinc-800 hover:border-indigo-500 transition p-6 rounded-2xl cursor-pointer"
                >
                  <h3 className="text-2xl font-semibold mb-3">
                    {project.title}
                  </h3>

                  <div className="flex gap-3 mb-4">
                    <span className="bg-indigo-600 px-3 py-1 rounded-full text-sm">
                      {project.level}
                    </span>

                    <span className="bg-green-600 px-3 py-1 rounded-full text-sm">
                      {project.realWorld} Real-World
                    </span>
                  </div>

                  <p className="text-zinc-400">
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TOTAL */}
      {repos.length > 0 && (
        <div className="mb-6 text-zinc-400">
          Found {total} repositories
        </div>
      )}

      {/* AI SUMMARY */}
      {summary && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            AI Summary
          </h2>

          <pre className="whitespace-pre-wrap text-zinc-300">
            {summary}
          </pre>
        </div>
      )}

      {/* REPOS */}
      <div className="grid gap-6">
        {repos.map((repo) => (
          <div
            key={repo.id}
            className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-semibold">
                {repo.full_name}
              </h2>

              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300"
              >
                View Repo →
              </a>
            </div>

            <p className="text-zinc-400 mb-4">
              {repo.description}
            </p>

            <div className="flex gap-6 text-sm text-zinc-500">
              <span>⭐ {repo.stargazers_count}</span>
              <span>🍴 {repo.forks_count}</span>
              <span>🐛 {repo.open_issues_count}</span>
              <span>{repo.language}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 w-[750px] max-h-[80vh] overflow-auto p-8 rounded-2xl border border-zinc-800">
            <h2 className="text-3xl font-bold mb-4">
              {selectedProject.title}
            </h2>

            <p className="text-zinc-300 mb-6">
              {selectedProject.description}
            </p>

            <div className="flex gap-4 mb-6">
              <span className="bg-indigo-600 px-3 py-1 rounded-full">
                {selectedProject.level}
              </span>

              <span className="bg-green-600 px-3 py-1 rounded-full">
                {selectedProject.realWorld} Real-World
              </span>
            </div>

            <h3 className="text-2xl font-semibold mb-4">
              Top GitHub Repositories
            </h3>

            <div className="space-y-3">
              {selectedProject.repos?.map((repo, idx) => (
                <a
                  key={idx}
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block bg-zinc-800 hover:bg-zinc-700 transition p-4 rounded-xl"
                >
                  <div className="font-semibold">
                    {repo.name}
                  </div>

                  <div className="text-sm text-zinc-400">
                    ⭐ {repo.stars}
                  </div>
                </a>
              ))}
            </div>

            <button
              onClick={() => setSelectedProject(null)}
              className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}