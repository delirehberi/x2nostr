import { GistSnippetRecord } from '../../types';
import { detectLanguage, extractExtension } from './language-detector';
import { gitHubService, GitHubGistItem } from './github-service';

/**
 * Extracts hashtag topics from text (e.g. "#nostr #python #crypto" -> ["nostr", "python", "crypto"]).
 */
export function extractTopics(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/#([a-zA-Z0-9_-]+)/g);
  if (!matches) return [];
  const topics = new Set<string>();
  for (const m of matches) {
    const clean = m.slice(1).toLowerCase().trim();
    if (clean.length > 1) {
      topics.add(clean);
    }
  }
  return [...topics];
}

/**
 * Parses GitHub API Gist items into normalized GistSnippetRecord objects.
 * Efficiently handles multi-file gists and retrieves missing/truncated content via CDN raw_url.
 */
export async function parseGitHubGistItems(
  gists: GitHubGistItem[],
  onProgress?: (status: string) => void
): Promise<GistSnippetRecord[]> {
  const records: GistSnippetRecord[] = [];

  for (let i = 0; i < gists.length; i++) {
    const gist = gists[i];
    const gistId = gist.id;
    const isPublic = Boolean(gist.public);
    const description = (gist.description || '').trim();
    const repoUrl = gist.html_url || `https://gist.github.com/${gistId}`;
    const createdAtTimestamp = gist.created_at
      ? Math.floor(new Date(gist.created_at).getTime() / 1000)
      : Math.floor(Date.now() / 1000);
    const tags = extractTopics(description);

    const files = Object.values(gist.files || {});

    for (let fIdx = 0; fIdx < files.length; fIdx++) {
      const file = files[fIdx];
      const filename = file.filename || `snippet-${gistId.slice(0, 8)}-${fIdx + 1}.txt`;
      const { language, extension } = detectLanguage(filename, file.language || undefined);

      let content = file.content || '';
      // If content was truncated (>64KB) or not provided in the gist list view, fetch from CDN
      if ((!content && file.raw_url) || file.truncated) {
        if (onProgress) {
          onProgress(`Fetching file content for "${filename}" from CDN...`);
        }
        try {
          content = await gitHubService.fetchRawContent(file.raw_url);
        } catch (fetchErr) {
          console.warn(`Could not fetch raw content for ${filename}:`, fetchErr);
          content = '';
        }
        // Polite delay between raw content fetches to avoid flood
        await new Promise((r) => setTimeout(r, 40));
      }

      const sizeBytes = file.size || new Blob([content]).size;
      const id = `gist_${gistId}_${fIdx}_${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

      records.push({
        id,
        gistId,
        name: filename,
        extension: extension || extractExtension(filename),
        language,
        description,
        content,
        repoUrl,
        rawUrl: file.raw_url,
        createdAtTimestamp,
        sizeBytes,
        isPublic,
        selected: isPublic, // Public gists selected by default; Secret gists require explicit confirmation
        tags: tags.length > 0 ? tags : undefined,
      });
    }
  }

  return records;
}

/**
 * Ingests local files dropped into the browser as code snippet records.
 */
export async function parseCodeFiles(files: File[]): Promise<GistSnippetRecord[]> {
  const records: GistSnippetRecord[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filename = file.name;
    const { language, extension } = detectLanguage(filename);
    const content = await file.text();
    const sizeBytes = file.size || new Blob([content]).size;
    const createdAtTimestamp = file.lastModified
      ? Math.floor(file.lastModified / 1000)
      : Math.floor(Date.now() / 1000);

    const id = `file_${Date.now()}_${i}_${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

    records.push({
      id,
      gistId: `local-${i + 1}`,
      name: filename,
      extension: extension || extractExtension(filename),
      language,
      description: `Imported local code file: ${filename}`,
      content,
      createdAtTimestamp,
      sizeBytes,
      isPublic: true,
      selected: true,
    });
  }

  return records;
}

/**
 * Parses raw JSON string containing Gist snippet export data.
 */
export function parseGistJsonString(jsonStr: string): GistSnippetRecord[] {
  const parsed = JSON.parse(jsonStr);
  const items = Array.isArray(parsed) ? parsed : [parsed];
  const records: GistSnippetRecord[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;

    // Direct GistSnippetRecord shape
    if (item.name && typeof item.content === 'string') {
      const { language, extension } = detectLanguage(item.name, item.language);
      records.push({
        id: item.id || `snippet_${Date.now()}_${i}`,
        gistId: item.gistId || item.id || `json-${i + 1}`,
        name: item.name,
        extension: item.extension || extension,
        language: item.language ? item.language.toLowerCase() : language,
        description: (item.description || '').trim(),
        content: item.content,
        runtime: item.runtime || undefined,
        license: item.license || undefined,
        dependencies: Array.isArray(item.dependencies) ? item.dependencies : undefined,
        repoUrl: item.repoUrl || undefined,
        createdAtTimestamp: item.createdAtTimestamp || Math.floor(Date.now() / 1000),
        sizeBytes: item.sizeBytes || new Blob([item.content]).size,
        isPublic: item.isPublic !== false,
        selected: item.isPublic !== false,
        tags: Array.isArray(item.tags) ? item.tags : extractTopics(item.description || ''),
      });
      continue;
    }

    // GitHub API item shape
    if (item.files && typeof item.files === 'object') {
      const isPublic = Boolean(item.public);
      const gistId = item.id || `gist-${i + 1}`;
      const repoUrl = item.html_url || '';
      const description = (item.description || '').trim();
      const createdAtTimestamp = item.created_at
        ? Math.floor(new Date(item.created_at).getTime() / 1000)
        : Math.floor(Date.now() / 1000);

      const files = Object.values(item.files) as Array<{
        filename?: string;
        language?: string;
        content?: string;
        size?: number;
      }>;

      files.forEach((f, fIdx) => {
        const filename = f.filename || `snippet-${fIdx + 1}.txt`;
        const { language, extension } = detectLanguage(filename, f.language);
        const content = f.content || '';
        records.push({
          id: `json_${gistId}_${fIdx}_${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
          gistId,
          name: filename,
          extension: extension || extractExtension(filename),
          language,
          description,
          content,
          repoUrl,
          createdAtTimestamp,
          sizeBytes: f.size || new Blob([content]).size,
          isPublic,
          selected: isPublic,
          tags: extractTopics(description),
        });
      });
    }
  }

  return records;
}
