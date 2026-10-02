import type {Catalog,Fragrance} from '../catalog/types';import {getComparableOffers} from '../offers/compare';import {preferencesSchema,type Preferences,type RecommendationResult,type CandidateJudgment,type Recommendation} from './types';
// Editorial weights, not measured enjoyment probabilities: desired trait 2/level,
// occasion 6, setting 4, presence 2, climate up to 5. Jev adds at most 8.
export function eligibleCandidates(c:Catalog,p:Preferences,now=new Date()):{eligible:Recommendation[];exclusions:RecommendationResult['exclusions']}{
 const eligible:Recommendation[]=[],exclusions:RecommendationResult['exclusions']=[];
 for(const v of c.variants){const f=c.fragrances.find(f=>f.id===v.fragranceId);let reason='';let budgetEvidence:Recommendation['budgetEvidence']='unknown';
  if(!f||v.identityStatus!=='confirmed')reason='identity';
  else if(p.excludedTraitIds.some(t=>(f.profile.traits[t]??0)>0))reason='dislike';
  if(!f){exclusions.push({variantId:v.id,reason});continue;}
  const offer=getComparableOffers(v,c.offers,now).cheapestDelivered;
  let price:number|null=null;
  if(offer){price=offer.amountInr+(offer.shippingInr??0);budgetEvidence='observed';}
  else if(p.budgetMode==='reference-ok'&&f.referencePrice.kind==='reference'){price=f.referencePrice.amountInr;budgetEvidence='reference';}
  if(!reason&&((p.budgetMode==='observed-only'&&budgetEvidence!=='observed')||(p.maxBudgetInr!==null&&(price===null||price>p.maxBudgetInr))))reason='budget';
  if(reason){exclusions.push({variantId:v.id,reason});continue;}
  const reasons:string[]=[];let score=0;
  for(const t of p.desiredTraitIds){const intensity=f.profile.traits[t]??0;score+=intensity*2;if(intensity>=3)reasons.push('trait:'+t);}
  if(f.occasions.includes(p.occasion)){score+=6;reasons.push('occasion:'+p.occasion);}
  if(f.settings.includes(p.setting)){score+=4;reasons.push('setting:'+p.setting);}
  if(f.presence===p.presence)score+=2;
  if(p.climate==='hot')score+=(f.profile.traits.fresh??0);if(p.climate==='cool')score+=((f.profile.traits.spicy??0)+(f.profile.traits.creamy??0))/2;
  const liked=c.fragrances.filter(x=>p.likedProductIds.includes(x.id));if(liked.length){const shared=liked.some(x=>x.profile.family===f.profile.family);if(shared){score+=5;reasons.push('liked-family');}}
  if(!reasons.length)reasons.push('explore');
  const caveats=[...f.cautions];if(budgetEvidence==='reference')caveats.push('Budget fit uses an unverified user reference. Confirm the exact size and final delivered price.');else if(budgetEvidence==='unknown')caveats.push('Price is unknown. This result does not establish budget fit.');
  if(p.setting==='shared'&&f.presence==='bold')caveats.unshift('This is a richer scent direction. Sample cautiously for a shared space; actual projection is unmeasured.');
  if(!caveats.length)caveats.push('No independent longevity or projection measurements. Sample on your skin before a full bottle.');
  eligible.push({variantId:v.id,fragranceId:f.id,score,reasonCodes:reasons,caveats,budgetEvidence});
 }
 return {eligible,exclusions};
}
export function rankCandidates(c:Catalog,p:Preferences,judgments?:readonly CandidateJudgment[]):RecommendationResult{
 if(!preferencesSchema.safeParse(p).success)return {candidates:[],exclusions:[],noMatchReason:'Please check your answers.',method:'rules'};
 const {eligible,exclusions}=eligibleCandidates(c,p);const known=new Map((judgments??[]).filter(j=>Number.isFinite(j.score)&&j.score>=0&&j.score<=4&&eligible.some(x=>x.variantId===j.variantId)).map(j=>[j.variantId,j.score]));
 const pool=eligible.map(x=>({...x,score:x.score+(known.get(x.variantId)??0)*2}));const candidates:Recommendation[]=[];
 const family=(r:Recommendation):Fragrance['profile']['family']=>c.fragrances.find(f=>f.id===r.fragranceId)!.profile.family;
 while(pool.length&&candidates.length<3){const adjusted=(r:Recommendation)=>r.score-4*candidates.filter(x=>family(x)===family(r)).length;pool.sort((a,b)=>adjusted(b)-adjusted(a)||a.variantId.localeCompare(b.variantId));const next=pool.shift()!;if(!candidates.some(x=>x.fragranceId===next.fragranceId))candidates.push(next);}
 return {candidates,exclusions,noMatchReason:candidates.length?null:'No scents meet these constraints. Try changing your budget, price evidence mode or dislikes. We won’t relax them automatically.',method:known.size?'jev':'rules'};
}
