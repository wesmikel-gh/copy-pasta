import { describe, it, expect } from 'vitest';
import {
  toSentenceCase,
  toCapitalizedCase,
  toTitleCase,
  applyExclusions,
  convertCase,
  tools,
  findAndReplace,
  generateLorem,
  getTextStats,
  loremPool,
} from '../js/tools.js';

// ── Case Conversion ──

describe('toSentenceCase', () => {
  it('capitalizes the first letter', () => {
    expect(toSentenceCase('hello world')).toBe('Hello world');
  });

  it('capitalizes after periods', () => {
    expect(toSentenceCase('hello world. goodbye world.')).toBe('Hello world. Goodbye world.');
  });

  it('capitalizes after exclamation marks', () => {
    expect(toSentenceCase('wow! that is great')).toBe('Wow! That is great');
  });

  it('lowercases everything else', () => {
    expect(toSentenceCase('HELLO WORLD')).toBe('Hello world');
  });
});

describe('toCapitalizedCase', () => {
  it('capitalizes every word', () => {
    expect(toCapitalizedCase('hello world')).toBe('Hello World');
  });

  it('handles already-capitalized text', () => {
    expect(toCapitalizedCase('HELLO WORLD')).toBe('Hello World');
  });

  it('handles mixed case', () => {
    expect(toCapitalizedCase('hELLo wORLd')).toBe('Hello World');
  });
});

describe('toTitleCase', () => {
  it('capitalizes major words', () => {
    expect(toTitleCase('the quick brown fox')).toBe('The Quick Brown Fox');
  });

  it('keeps small words lowercase', () => {
    expect(toTitleCase('war and peace')).toBe('War and Peace');
  });

  it('always capitalizes the first word', () => {
    expect(toTitleCase('a tale of two cities')).toBe('A Tale of Two Cities');
  });
});

describe('applyExclusions', () => {
  it('preserves excluded words in their original form', () => {
    const result = applyExclusions('hello ios world', ['iOS']);
    expect(result).toBe('hello iOS world');
  });

  it('handles multiple exclusions', () => {
    const result = applyExclusions('bmw and ios', ['BMW', 'iOS']);
    expect(result).toBe('BMW and iOS');
  });

  it('leaves text unchanged when no exclusions match', () => {
    expect(applyExclusions('hello world', ['iOS'])).toBe('hello world');
  });
});

describe('convertCase', () => {
  it('converts to lowercase', () => {
    expect(convertCase('Hello World', 'lower')).toBe('hello world');
  });

  it('converts to uppercase', () => {
    expect(convertCase('Hello World', 'upper')).toBe('HELLO WORLD');
  });

  it('applies exclusions after conversion', () => {
    expect(convertCase('Visit BMW today', 'lower', ['BMW'])).toBe('visit BMW today');
  });

  it('returns original text if empty', () => {
    expect(convertCase('   ', 'upper')).toBe('   ');
  });
});

// ── Tool Operations ──

describe('tools.slug', () => {
  it('converts text to a URL slug', () => {
    expect(tools.slug('About Our Company')).toBe('about-our-company');
  });

  it('removes special characters', () => {
    expect(tools.slug('Hello, World! (2024)')).toBe('hello-world-2024');
  });

  it('collapses multiple hyphens', () => {
    expect(tools.slug('hello---world')).toBe('hello-world');
  });

  it('trims leading/trailing hyphens', () => {
    expect(tools.slug('  hello world  ')).toBe('hello-world');
  });

  it('preserves line breaks — each line becomes its own slug', () => {
    const input = 'About Us\nMeet The Team\nContact';
    const expected = 'about-us\nmeet-the-team\ncontact';
    expect(tools.slug(input)).toBe(expected);
  });

  it('handles 5 lines of page titles', () => {
    const input = 'Home Page\nAbout Us\nOur Services\nPricing Plans\nContact Us';
    const expected = 'home-page\nabout-us\nour-services\npricing-plans\ncontact-us';
    expect(tools.slug(input)).toBe(expected);
  });

  it('removes smart quotes', () => {
    expect(tools.slug('it\u2019s a test')).toBe('its-a-test');
  });

  // ── Unicode & Emoji ──

  it('transliterates accented characters to ASCII equivalents', () => {
    expect(tools.slug('Café Menu')).toBe('cafe-menu');
  });

  it('transliterates multiple accented characters', () => {
    expect(tools.slug('Résumé Tips')).toBe('resume-tips');
  });

  it('strips emoji cleanly', () => {
    expect(tools.slug('Hello 👋 World')).toBe('hello-world');
  });

  it('converts em dashes to hyphens cleanly', () => {
    expect(tools.slug('Self-Serve — Pricing')).toBe('self-serve-pricing');
  });

  it('transliterates ñ and strips emoji', () => {
    expect(tools.slug('Piñata Party 🎉')).toBe('pinata-party');
  });

  it('handles line breaks with accented characters', () => {
    expect(tools.slug('Café\nNaïve')).toBe('cafe\nnaive');
  });

  it('handles only emoji input', () => {
    expect(tools.slug('🎉🎊🥳')).toBe('');
  });

  it('transliterates German umlauts', () => {
    expect(tools.slug('Über Uns')).toBe('uber-uns');
  });
});

describe('tools.strip-whitespace', () => {
  it('collapses multiple spaces into one', () => {
    expect(tools['strip-whitespace']('hello    world')).toBe('hello world');
  });

  it('trims leading/trailing spaces per line', () => {
    expect(tools['strip-whitespace']('  hello  ')).toBe('hello');
  });

  it('collapses 3+ newlines into 2', () => {
    expect(tools['strip-whitespace']('a\n\n\n\nb')).toBe('a\n\nb');
  });
});

describe('tools.remove-breaks', () => {
  it('joins lines into a single line', () => {
    expect(tools['remove-breaks']('hello\nworld')).toBe('hello world');
  });

  it('collapses multiple breaks and spaces', () => {
    expect(tools['remove-breaks']('hello\n\n\nworld')).toBe('hello world');
  });
});

describe('tools.smart-quotes', () => {
  it('converts straight double quotes to curly', () => {
    const result = tools['smart-quotes']('"hello"');
    expect(result).toContain('\u201C');
    expect(result).toContain('\u201D');
  });

  it('converts apostrophes in contractions to right single quote', () => {
    const result = tools['smart-quotes']("it's a don't can't");
    // Apostrophes in contractions should become right single quotes (\u2019)
    expect(result).toBe('it\u2019s a don\u2019t can\u2019t');
  });

  it('handles nested quotes — double outside, apostrophe inside', () => {
    const result = tools['smart-quotes']('She said "don\'t go"');
    expect(result).toBe('She said \u201Cdon\u2019t go\u201D');
  });

  it('handles quotes on separate lines independently', () => {
    const result = tools['smart-quotes']('"Hello"\n"World"');
    expect(result).toBe('\u201CHello\u201D\n\u201CWorld\u201D');
  });

  it('handles closing quote before punctuation', () => {
    const result = tools['smart-quotes']('"Wait!" she said.');
    expect(result).toBe('\u201CWait!\u201D she said.');
  });

  it('handles quotes inside parentheses', () => {
    const result = tools['smart-quotes']('(see "details")');
    expect(result).toBe('(see \u201Cdetails\u201D)');
  });

  it('handles single quotes inside brackets', () => {
    const result = tools['smart-quotes']("[the 'key' value]");
    expect(result).toBe('[the \u2018key\u2019 value]');
  });
});

describe('tools.straight-quotes', () => {
  it('converts curly quotes to straight', () => {
    expect(tools['straight-quotes']('\u201Chello\u201D')).toBe('"hello"');
    expect(tools['straight-quotes']('\u2018hello\u2019')).toBe("'hello'");
  });
});

describe('smart-quotes and straight-quotes round-trip', () => {
  it('survives curly → straight → curly conversion', () => {
    const original = '\u201CHello,\u201D she said. \u201CHow\u2019s it going?\u201D';
    const straightened = tools['straight-quotes'](original);
    const recurled = tools['smart-quotes'](straightened);
    expect(recurled).toBe(original);
  });
});

describe('tools.html-encode', () => {
  it('encodes HTML entities', () => {
    expect(tools['html-encode']('<p>"Hello" & \'world\'</p>')).toBe('&lt;p&gt;&quot;Hello&quot; &amp; &#039;world&#039;&lt;/p&gt;');
  });
});

describe('tools.url-encode', () => {
  it('encodes special URL characters', () => {
    expect(tools['url-encode']('hello world&foo=bar')).toBe('hello%20world%26foo%3Dbar');
  });
});

describe('tools.url-decode', () => {
  it('decodes URL-encoded strings', () => {
    expect(tools['url-decode']('hello%20world%26foo%3Dbar')).toBe('hello world&foo=bar');
  });

  it('returns original string on invalid encoding', () => {
    expect(tools['url-decode']('%ZZinvalid')).toBe('%ZZinvalid');
  });
});

describe('tools.sort-az', () => {
  it('sorts lines alphabetically', () => {
    expect(tools['sort-az']('banana\napple\ncherry')).toBe('apple\nbanana\ncherry');
  });
});

describe('tools.sort-za', () => {
  it('sorts lines reverse alphabetically', () => {
    expect(tools['sort-za']('banana\napple\ncherry')).toBe('cherry\nbanana\napple');
  });
});

describe('tools.dedup', () => {
  it('removes duplicate lines', () => {
    expect(tools.dedup('apple\nbanana\napple\ncherry\nbanana')).toBe('apple\nbanana\ncherry');
  });
});

describe('tools.number-lines', () => {
  it('adds line numbers', () => {
    expect(tools['number-lines']('apple\nbanana')).toBe('1. apple\n2. banana');
  });
});

describe('tools.bullet-lines', () => {
  it('adds bullet points', () => {
    expect(tools['bullet-lines']('apple\nbanana')).toBe('\u2022 apple\n\u2022 banana');
  });
});

// ── Find & Replace ──

describe('findAndReplace', () => {
  it('replaces all occurrences', () => {
    expect(findAndReplace('hello world hello', 'hello', 'hi')).toBe('hi world hi');
  });

  it('returns original text when find is empty', () => {
    expect(findAndReplace('hello world', '', 'hi')).toBe('hello world');
  });

  it('handles special regex characters in find string', () => {
    expect(findAndReplace('price is $10.00', '$10.00', '$20.00')).toBe('price is $20.00');
  });
});

// ── Lorem Ipsum ──

describe('generateLorem', () => {
  it('generates the requested number of sentences', () => {
    const result = generateLorem(3, 'sentences');
    const sentences = result.split(/[.!?]+\s*/).filter(s => s.trim());
    expect(sentences.length).toBe(3);
  });

  it('generates the requested number of paragraphs', () => {
    const result = generateLorem(2, 'paragraphs');
    const paragraphs = result.split('\n\n');
    expect(paragraphs.length).toBe(2);
  });

  it('defaults to 3 sentences', () => {
    const result = generateLorem();
    const sentences = result.split(/[.!?]+\s*/).filter(s => s.trim());
    expect(sentences.length).toBe(3);
  });
});

// ── Text Stats ──

describe('getTextStats', () => {
  it('counts characters', () => {
    expect(getTextStats('hello').chars).toBe(5);
  });

  it('counts words', () => {
    expect(getTextStats('hello world foo').words).toBe(3);
  });

  it('counts lines', () => {
    expect(getTextStats('line one\nline two\nline three').lines).toBe(3);
  });

  it('returns zeros for empty string', () => {
    const stats = getTextStats('');
    expect(stats.chars).toBe(0);
    expect(stats.words).toBe(0);
    expect(stats.sentences).toBe(0);
    expect(stats.lines).toBe(0);
  });

  it('calculates reading time', () => {
    const stats = getTextStats('word '.repeat(42).trim());
    expect(stats.readSec).toBe(10); // 42 words / 4.2 wps = 10s
  });
});
