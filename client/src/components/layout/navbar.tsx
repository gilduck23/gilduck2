import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-[#2B3A67] text-white">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Link href="/">
            <a className="text-xl font-bold">Aozini12</a>
          </Link>
          <Link href="/admin">
            <Button variant="ghost" className="text-white" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}