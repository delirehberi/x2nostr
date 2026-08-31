import { describe, expect, it } from 'vitest';
import { buildEncryptedGistEvent, buildGistDeletionEvent, buildGistSnippetEvent } from '../src/importers/gists/event-builder';
import { GistSnippetRecord } from '../src/types';

describe('NIP-C0 Gist Event Builder', () => {
  const SAMPLE_RECORD: GistSnippetRecord = {
    id: 'test-1',
    gistId: 'gist-abc',
    name: 'fibonacci.ts',
    extension: 'ts',
    language: 'typescript',
    description: 'Calculates Fibonacci numbers efficiently',
    content: 'export function fib(n: number): number { return n <= 1 ? n : fib(n-1) + fib(n-2); }',
    runtime: 'node v22',
    license: 'MIT',
    dependencies: ['lodash@4.17.21'],
    repoUrl: 'https://gist.github.com/alice/gist-abc',
    createdAtTimestamp: 1715000000,
    sizeBytes: 80,
    isPublic: true,
    tags: ['algorithms', 'math'],
  };

  const PUBKEY = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';

  it('should build a valid Kind 1337 NIP-C0 event with all tags', () => {
    const event = buildGistSnippetEvent(SAMPLE_RECORD, PUBKEY);

    expect(event.kind).toBe(1337);
    expect(event.pubkey).toBe(PUBKEY);
    expect(event.content).toBe(SAMPLE_RECORD.content);
    expect(event.created_at).toBe(SAMPLE_RECORD.createdAtTimestamp);

    const nameTag = event.tags.find((t) => t[0] === 'name');
    expect(nameTag).toEqual(['name', 'fibonacci.ts']);

    const langTag = event.tags.find((t) => t[0] === 'l');
    expect(langTag).toEqual(['l', 'typescript']);

    const extTag = event.tags.find((t) => t[0] === 'extension');
    expect(extTag).toEqual(['extension', 'ts']);

    const descTag = event.tags.find((t) => t[0] === 'description');
    expect(descTag).toEqual(['description', 'Calculates Fibonacci numbers efficiently']);

    const runtimeTag = event.tags.find((t) => t[0] === 'runtime');
    expect(runtimeTag).toEqual(['runtime', 'node v22']);

    const licenseTag = event.tags.find((t) => t[0] === 'license');
    expect(licenseTag).toEqual(['license', 'MIT']);

    const depTag = event.tags.find((t) => t[0] === 'dep');
    expect(depTag).toEqual(['dep', 'lodash@4.17.21']);

    const repoTag = event.tags.find((t) => t[0] === 'repo');
    expect(repoTag).toEqual(['repo', 'https://gist.github.com/alice/gist-abc']);

    const clientTag = event.tags.find((t) => t[0] === 'client');
    expect(clientTag).toEqual(['client', 'x2nostr']);

    const topicTags = event.tags.filter((t) => t[0] === 't').map((t) => t[1]);
    expect(topicTags).toContain('algorithms');
    expect(topicTags).toContain('math');
  });

  it('should build a valid NIP-78 Kind 30078 event for encrypted secret gists', () => {
    const ciphertext = 'nip44:encrypted:payload:ciphertext:here';
    const event = buildEncryptedGistEvent(SAMPLE_RECORD, PUBKEY, ciphertext);

    expect(event.kind).toBe(30078);
    expect(event.pubkey).toBe(PUBKEY);
    expect(event.content).toBe(ciphertext);

    const dTag = event.tags.find((t) => t[0] === 'd');
    expect(dTag).toEqual(['d', 'x2nostr:gist:gist-abc:fibonacci.ts']);

    const encTag = event.tags.find((t) => t[0] === 'encrypted');
    expect(encTag).toEqual(['encrypted', 'nip44']);
  });

  it('should build a valid NIP-09 Kind 5 deletion event', () => {
    const eventIds = ['event-1', 'event-2'];
    const event = buildGistDeletionEvent(eventIds, 'Clean import', PUBKEY, 1337);

    expect(event.kind).toBe(5);
    expect(event.pubkey).toBe(PUBKEY);
    expect(event.tags.filter((t) => t[0] === 'e')).toHaveLength(2);
    expect(event.tags.find((t) => t[0] === 'k')).toEqual(['k', '1337']);
  });
});
