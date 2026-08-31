import { describe, expect, it } from 'vitest';
import { detectLanguage, extractExtension } from '../src/importers/gists/language-detector';
import { extractTopics, parseGistJsonString, parseGitHubGistItems } from '../src/importers/gists/parser';
import { GitHubGistItem } from '../src/importers/gists/github-service';

describe('Gists Language Detector', () => {
  it('should detect extension and language correctly for various files', () => {
    expect(detectLanguage('index.ts')).toEqual({ language: 'typescript', extension: 'ts' });
    expect(detectLanguage('main.py')).toEqual({ language: 'python', extension: 'py' });
    expect(detectLanguage('quicksort.rs')).toEqual({ language: 'rust', extension: 'rs' });
    expect(detectLanguage('server.go')).toEqual({ language: 'go', extension: 'go' });
    expect(detectLanguage('deploy.sh')).toEqual({ language: 'shell', extension: 'sh' });
    expect(detectLanguage('Dockerfile')).toEqual({ language: 'dockerfile', extension: 'dockerfile' });
    expect(detectLanguage('schema.sql')).toEqual({ language: 'sql', extension: 'sql' });
  });

  it('should extract extension without dot', () => {
    expect(extractExtension('style.css')).toBe('css');
    expect(extractExtension('README.md')).toBe('md');
    expect(extractExtension('archive.tar.gz')).toBe('gz');
    expect(extractExtension('noextension')).toBe('');
  });
});

describe('Gists Topic Extractor', () => {
  it('should extract hashtags as clean lowercase topics', () => {
    const text = 'Sovereign algorithm demo #Nostr #TypeScript #crypto';
    const topics = extractTopics(text);
    expect(topics).toEqual(['nostr', 'typescript', 'crypto']);
  });

  it('should handle text without hashtags', () => {
    expect(extractTopics('Simple script with no tags')).toEqual([]);
    expect(extractTopics('')).toEqual([]);
  });
});

describe('GitHub Gist Item Parser', () => {
  const SAMPLE_GIST: GitHubGistItem = {
    id: 'a1b2c3d4e5',
    html_url: 'https://gist.github.com/alice/a1b2c3d4e5',
    description: 'A sovereign quicksort script #nostr #rust',
    public: true,
    created_at: '2026-05-10T12:00:00Z',
    updated_at: '2026-05-10T12:30:00Z',
    files: {
      'quicksort.rs': {
        filename: 'quicksort.rs',
        type: 'text/plain',
        language: 'Rust',
        raw_url: 'https://gist.githubusercontent.com/alice/raw/quicksort.rs',
        size: 256,
        content: 'fn quicksort() { println!("Hello Nostr"); }',
      },
      'helper.rs': {
        filename: 'helper.rs',
        type: 'text/plain',
        language: 'Rust',
        raw_url: 'https://gist.githubusercontent.com/alice/raw/helper.rs',
        size: 128,
        content: 'fn helper() {}',
      },
    },
  };

  it('should parse multi-file gists into individual GistSnippetRecord entries', async () => {
    const records = await parseGitHubGistItems([SAMPLE_GIST]);
    expect(records).toHaveLength(2);

    const first = records[0];
    expect(first.gistId).toBe('a1b2c3d4e5');
    expect(first.name).toBe('quicksort.rs');
    expect(first.language).toBe('rust');
    expect(first.extension).toBe('rs');
    expect(first.content).toContain('fn quicksort()');
    expect(first.isPublic).toBe(true);
    expect(first.selected).toBe(true);
    expect(first.repoUrl).toBe('https://gist.github.com/alice/a1b2c3d4e5');
    expect(first.tags).toContain('nostr');
    expect(first.tags).toContain('rust');

    const second = records[1];
    expect(second.name).toBe('helper.rs');
    expect(second.content).toBe('fn helper() {}');
  });

  it('should identify secret gists as not public and unselected by default', async () => {
    const SECRET_GIST: GitHubGistItem = {
      ...SAMPLE_GIST,
      id: 'secret123',
      public: false,
    };
    const records = await parseGitHubGistItems([SECRET_GIST]);
    expect(records[0].isPublic).toBe(false);
    expect(records[0].selected).toBe(false);
  });
});

describe('Gist JSON Parser', () => {
  it('should parse JSON export strings with custom snippet objects', () => {
    const jsonStr = JSON.stringify([
      {
        name: 'hello.py',
        content: 'print("hello world")',
        description: 'Simple Python script',
        language: 'python',
        license: 'MIT',
      },
    ]);

    const records = parseGistJsonString(jsonStr);
    expect(records).toHaveLength(1);
    expect(records[0].name).toBe('hello.py');
    expect(records[0].language).toBe('python');
    expect(records[0].extension).toBe('py');
    expect(records[0].license).toBe('MIT');
    expect(records[0].content).toBe('print("hello world")');
  });
});
