import Link from 'next/link';
import { Compass, FlaskConical, Layers3, Bookmark } from 'lucide-react';
export function SiteHeader() {
  return <header className="site-header"><Link href="/" className="wordmark" aria-label="Perfume Atlas home"><Compass size={24}/><span>PERFUME <strong>ATLAS</strong></span></Link><nav aria-label="Main navigation"><Link href="/">Collection</Link><Link href="/discover"><FlaskConical size={16}/>Find my scent</Link><Link href="/compare"><Layers3 size={16}/>Compare</Link><Link href="/shelf"><Bookmark size={16}/>My shelf</Link></nav><span className="header-location">INDIA · INR</span></header>;
}
