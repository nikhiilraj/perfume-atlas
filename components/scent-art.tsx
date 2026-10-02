import type {CSSProperties} from 'react';
export function ScentArt({color,small=false}:{color:string;small?:boolean}){return <div className={small?'scent-art small':'scent-art'} aria-hidden="true" style={{'--scent':color} as CSSProperties}><div className="scent-orb"/><i/><b/></div>;}
