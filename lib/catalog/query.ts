import {catalog} from './data';
export const getCatalog = () => catalog;
export const getFragrance = (slug:string) => catalog.fragrances.find(f=>f.slug===slug);
export const getVariants = (fragranceId:string) => catalog.variants.filter(v=>v.fragranceId===fragranceId);
export const formatInr = (amount:number) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(amount);
