import { GistMigrationOptions, GistSnippetRecord, UnsignedNostrEvent } from '../../types';
import { normalizeTopic } from '../../services/tags';

/**
 * Builds an unsigned NIP-C0 Code Snippet event (Kind 1337).
 */
export function buildGistSnippetEvent(
  snippet: GistSnippetRecord,
  pubkey: string,
  options?: GistMigrationOptions
): UnsignedNostrEvent {
  const tags: string[][] = [
    ['name', snippet.name],
    ['l', snippet.language.toLowerCase()],
    ['client', 'x2nostr'],
    ['published_at', String(snippet.createdAtTimestamp)],
  ];

  if (snippet.extension && snippet.extension.trim()) {
    tags.push(['extension', snippet.extension.trim()]);
  }

  if (snippet.description && snippet.description.trim()) {
    tags.push(['description', snippet.description.trim()]);
  }

  const runtime = snippet.runtime || options?.defaultRuntime;
  if (runtime && runtime.trim()) {
    tags.push(['runtime', runtime.trim()]);
  }

  const license = snippet.license || options?.defaultLicense;
  if (license && license.trim()) {
    tags.push(['license', license.trim()]);
  }

  if (snippet.dependencies && snippet.dependencies.length > 0) {
    snippet.dependencies.forEach((dep) => {
      if (dep && dep.trim()) {
        tags.push(['dep', dep.trim()]);
      }
    });
  }

  if (snippet.repoUrl && snippet.repoUrl.trim()) {
    tags.push(['repo', snippet.repoUrl.trim()]);
  }

  if (snippet.tags && snippet.tags.length > 0) {
    snippet.tags.forEach((tag) => {
      const clean = normalizeTopic(tag);
      if (clean) {
        tags.push(['t', clean]);
      }
    });
  }

  return {
    kind: 1337,
    created_at: snippet.createdAtTimestamp,
    tags,
    content: snippet.content,
    pubkey,
  };
}

/**
 * Builds an unsigned NIP-78 Application Data event (Kind 30078) for NIP-44 encrypted private gists.
 */
export function buildEncryptedGistEvent(
  snippet: GistSnippetRecord,
  pubkey: string,
  encryptedContent: string
): UnsignedNostrEvent {
  const dTag = `x2nostr:gist:${snippet.gistId}:${snippet.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;

  const tags: string[][] = [
    ['d', dTag],
    ['encrypted', 'nip44'],
    ['name', snippet.name],
    ['l', snippet.language.toLowerCase()],
    ['client', 'x2nostr'],
    ['published_at', String(snippet.createdAtTimestamp)],
  ];

  return {
    kind: 30078,
    created_at: snippet.createdAtTimestamp,
    tags,
    content: encryptedContent,
    pubkey,
  };
}

/**
 * Builds an unsigned NIP-09 Deletion Event (Kind 5) targeting code snippet events.
 */
export function buildGistDeletionEvent(
  eventIds: string[],
  reason = 'Replacing previous code snippets via x2nostr',
  pubkey: string,
  targetKind = 1337
): UnsignedNostrEvent {
  const tags: string[][] = eventIds.map((id) => ['e', id]);
  tags.push(['k', String(targetKind)]);

  return {
    kind: 5,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    content: reason,
    pubkey,
  };
}
