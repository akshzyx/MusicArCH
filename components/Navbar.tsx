"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSkull, faSearch } from "@fortawesome/free-solid-svg-icons";

const navItems = ["Nexus", "About", "Contact"];

const NavBar = () => {
  const navContainerRef = useRef(null);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false); // Track hydration

  useEffect(() => {
    setIsMounted(true); // Set after client-side mount
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Don’t render until mounted to avoid FOUC
  if (!isMounted) {
    return null; // Or a minimal placeholder
  }

  return (
    <div
      ref={navContainerRef}
      className={`fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-300 sm:inset-x-6 ${
        isNavVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
      }`}
    >
      <header className="absolute top-1/2 w-full -translate-y-1/2">
        <nav className="flex size-full items-center justify-between p-4 bg-black rounded-lg shadow-lg">
          <Link href="/" prefetch className="flex items-center gap-7">
            <FontAwesomeIcon icon={faSkull} size="2x" color="white" />
            <p className="font-bold text-white">JojiArCH</p>
          </Link>
          <div className="flex h-full items-center">
            <div className="flex items-center mx-4 flex-1 max-w-md relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" // Set explicit size
              />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search songs..."
                className="w-full pl-10 pr-3 py-1 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="hidden md:block">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={`/${item.toLowerCase()}`}
                  className="text-white mx-3 font-medium hover:text-blue-400"
                >
                  {item}
                </a>
              ))}
            </div>
            <Link
              href="/upload"
              prefetch
              className="ml-10 font-bold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Upload
            </Link>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default NavBar;
