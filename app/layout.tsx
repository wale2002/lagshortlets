import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'LAG Shortlets — Lagos, on your terms.',description:'Find the right part of Lagos. Then find your stay. Explore Lagos shortlets, homes for sale and annual rentals with LAG Shortlets.',metadataBase:new URL(process.env.APP_URL||(process.env.VERCEL_PROJECT_PRODUCTION_URL?'https://'+process.env.VERCEL_PROJECT_PRODUCTION_URL:'http://localhost:3000')),robots:{index:false,follow:false},openGraph:{title:'LAG Shortlets — Lagos, on your terms.',description:'Shortlets, homes and places to own across Lagos.',images:['/images/hero.jpg']}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
