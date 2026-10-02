import {describe,it,expect} from 'vitest';
import {getCatalog} from '@/lib/catalog/query';
import {validateCatalog} from '@/lib/catalog/validate';
import {makeCatalog,makeVariant} from './fixtures';
describe('catalog integrity',()=>{
 it('contains 15 unique products, separate CDN editions and resolving links',()=>{const c=getCatalog(); expect(c.fragrances).toHaveLength(15);expect(new Set(c.fragrances.map(f=>f.id)).size).toBe(15);expect(c.variants.filter(v=>v.fragranceId==='cdn-intense').map(v=>v.sizeMl)).toEqual([150,105]);expect(validateCatalog(c)).toEqual([]);expect(c.offers).toEqual([]);});
 it('rejects duplicate IDs and confirmed identity without concentration',()=>{const c=makeCatalog({variants:[makeVariant(),makeVariant({concentration:null})]});expect(validateCatalog(c).map(x=>x.code)).toEqual(expect.arrayContaining(['duplicate-id','incomplete-identity']));});
 it('rejects broken source and variant references',()=>{expect(validateCatalog(makeCatalog({variants:[makeVariant({fragranceId:'missing',sourceIds:['bad']})]})).length).toBeGreaterThan(0);});
});
