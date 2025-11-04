import Link from 'next/link';


export default function Header() {
return (
<header style={{display:'flex',gap:20,alignItems:'center',padding:20}}>
<Link href="/"><a style={{fontWeight:700,fontSize:20}}>Bake & Bite</a></Link>
<nav style={{marginLeft:'auto',display:'flex',gap:12}}>
<Link href="/menu"><a>Menu</a></Link>
<Link href="/cart"><a>Cart</a></Link>
<Link href="/admin"><a>Admin</a></Link>
</nav>
</header>
);
}