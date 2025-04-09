'use client';

// components/Navbar.js
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronDown } from "lucide-react"

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between text-black p-4 shadow-md" style={{ backgroundColor: '#EBE5EB', border: '1px solid #000000'  }}>
      <img src="/logo2.png" alt="Raices Logo" className="h-10 w-auto" />
      <div className="space-x-6">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <Link href="/projects" className="hover:underline">Projects</Link>
        <Link href="/roadmap" className="hover:underline">Roadmap</Link>
        <Link href="/teams" className="hover:underline">Team</Link>
        <Link
          href="/generate"
          className={`px-4 py-2 rounded-lg transition-colors border ${
            pathname === '/generate'
              ? 'bg-[#4A2B4A] text-white border-[#4A2B4A]'
              : 'text-[#4A2B4A] border-[#4A2B4A] hover:bg-[#4A2B4A]/10'
          }`}
        >
          Generate
        </Link>

      </div>
      {/* <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>            // VERSIóN VIEJA
      </div> */}
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <Bell className="h-5 w-5 text-gray-600" />                        {/* npm install lucide-react */}
        </button>

        <div className="flex items-center space-x-1">
          <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
            <img src="/placeholder.svg?height=32&width=32" alt="User Profile" className="h-full w-full object-cover" />
          </div>
          <ChevronDown className="h-4 w-4 text-gray-600" />                 {/* npm install lucide-react */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;