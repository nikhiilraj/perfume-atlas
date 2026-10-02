import {notFound} from 'next/navigation';import {getCatalog,getFragrance,getVariants} from '@/lib/catalog/query';import {PerfumeDetail} from '@/components/perfume-detail';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const f=getFragrance((await params).slug);return {title:f?.name??'Scent not found',description:f?.summary};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const f=getFragrance((await params).slug);if(!f)notFound();return <PerfumeDetail fragrance={f} variants={getVariants(f.id)} catalog={getCatalog()}/>;}
