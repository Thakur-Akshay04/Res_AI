const { cleanJsonResponse } = require('../utils/aiHelper');

describe('cleanJsonResponse', () => {
  it('should parse clean JSON as-is', () => {
    const input = '{"score": 85, "matched_keywords": ["React", "Node.js"]}';
    const result = cleanJsonResponse(input);
    const parsed = JSON.parse(result);
    expect(parsed.score).toBe(85);
    expect(parsed.matched_keywords).toContain('React');
  });

  it('should strip ```json code fences', () => {
    const input = '```json\n{"score": 90}\n```';
    const result = cleanJsonResponse(input);
    const parsed = JSON.parse(result);
    expect(parsed.score).toBe(90);
  });

  it('should strip ``` code fences without language', () => {
    const input = '```\n{"score": 75}\n```';
    const result = cleanJsonResponse(input);
    const parsed = JSON.parse(result);
    expect(parsed.score).toBe(75);
  });

  it('should handle extra whitespace', () => {
    const input = '  \n  {"summary": "Test summary"}  \n  ';
    const result = cleanJsonResponse(input);
    const parsed = JSON.parse(result);
    expect(parsed.summary).toBe('Test summary');
  });

  it('should handle complex nested JSON', () => {
    const input = '```json\n{"summary": "A summary", "experience": [{"company": "Acme", "role": "Dev", "duration": "2y", "bullets": ["Built APIs"]}], "skills": ["JavaScript"]}\n```';
    const result = cleanJsonResponse(input);
    const parsed = JSON.parse(result);
    expect(parsed.experience[0].company).toBe('Acme');
    expect(parsed.skills).toContain('JavaScript');
  });

  it('should handle case-insensitive JSON fence', () => {
    const input = '```JSON\n{"score": 88}\n```';
    const result = cleanJsonResponse(input);
    const parsed = JSON.parse(result);
    expect(parsed.score).toBe(88);
  });
});
