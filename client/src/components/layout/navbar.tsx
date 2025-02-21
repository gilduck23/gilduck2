import { Link } from "wouter";

export default function Navbar() {
  return (
    <nav className="bg-[#2B3A67] text-white">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Link href="/">
            <a className="text-xl font-bold">IndustrialCatalog</a>
          </Link>
        </div>
      </div>
    </nav>
  );
}
