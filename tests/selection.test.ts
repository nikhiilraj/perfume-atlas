import { describe, expect, it } from 'vitest';
import { parseComparisonIds } from '../lib/compare/selection';
describe('comparison selection', () => {
  it('keeps only three unique known variants in supplied order', () => {
    expect(parseComparisonIds('a,a,missing,b,c,d', new Set(['a','b','c','d']))).toEqual(['a','b','c']);
  });
  it('recovers from empty and unknown selections', () => {
    expect(parseComparisonIds(null, new Set(['a']))).toEqual([]);
    expect(parseComparisonIds('missing', new Set(['a']))).toEqual([]);
  });
});
