"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSkull,
  faSearch,
  faSpinner,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

const navItems = ["About"];

const NavBar = () => {
  const navContainerRef = useRef(null);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const isAdmin = isSignedIn && user?.publicMetadata?.role === "admin";
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsNavVisible(currentScrollY <= lastScrollY);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsLoading(true);
      await router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsLoading(false);
      setIsMenuOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") {
      e.stopPropagation();
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div
      ref={navContainerRef}
      className={`fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-300 sm:inset-x-6 animate-fadeIn ${
        isNavVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
      }`}
    >
      <header className="absolute top-1/2 w-full -translate-y-1/2">
        <nav className="flex w-full items-center justify-between px-6 py-3 bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl">
          {/* Logo Section */}
          <Link href="/" prefetch className="flex items-center gap-4">
            <FontAwesomeIcon
              icon={faSkull}
              size="2x"
              className="text-teal-400"
            />
            <p className="font-bold text-teal-400 text-lg">JojiArCH</p>
          </Link>

          {/* Right Side: Search and Menu (Mobile) or Full Nav (Desktop) */}
          <div className="flex items-center gap-6">
            {/* Search Component - Visible on all screens */}
            <div
              className="relative flex items-center h-10"
              onMouseEnter={() => setIsSearchHovered(true)}
              onMouseLeave={() => !searchQuery && setIsSearchHovered(false)}
            >
              <button
                onClick={() => setIsSearchHovered(true)}
                className={`absolute right-0 text-gray-300 hover:text-teal-400 transition-colors z-10 ${
                  isSearchHovered ? "opacity-0" : "opacity-100"
                }`}
              >
                <FontAwesomeIcon icon={faSearch} size="lg" />
              </button>
              <form
                onSubmit={handleSearch}
                className={`absolute right-0 flex items-center bg-gray-800/50 backdrop-blur-md rounded-full transition-all duration-300 overflow-hidden ${
                  isSearchHovered
                    ? "w-48 sm:w-64 px-4 py-2 opacity-100"
                    : "w-0 opacity-0"
                }`}
              >
                <button
                  type="submit"
                  className="text-gray-300 hover:text-teal-400 mr-2"
                >
                  <FontAwesomeIcon icon={faSearch} />
                </button>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search for songs..."
                  className="bg-transparent border-none text-white focus:outline-none w-full placeholder-gray-400"
                  autoFocus={isSearchHovered}
                />
                {isLoading && (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="text-teal-400 animate-spin ml-2"
                  />
                )}
              </form>
            </div>

            {/* Desktop: Nav Items, Upload, Sign In/User */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={`/${item.toLowerCase()}`}
                  className="text-gray-300 font-medium hover:text-teal-400 transition-colors duration-200"
                >
                  {item}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/upload"
                  prefetch
                  className="flex items-center font-bold text-white bg-teal-400 px-4 py-2 rounded-lg hover:bg-teal-500 transition-colors duration-200"
                >
                  Upload
                </Link>
              )}
              <div className="flex items-center">
                {isSignedIn ? (
                  <UserButton afterSignOutUrl="/" />
                ) : (
                  <SignInButton mode="modal">
                    <button className="font-bold text-white bg-teal-400 px-4 py-2 rounded-lg hover:bg-teal-500 transition-colors duration-200">
                      Sign In
                    </button>
                  </SignInButton>
                )}
              </div>
            </div>

            {/* Mobile: Hamburger Menu */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="text-gray-300 hover:text-teal-400 transition-colors"
              >
                <FontAwesomeIcon
                  icon={isMenuOpen ? faTimes : faBars}
                  size="lg"
                />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 right-6 w-48 bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl py-4 z-50 animate-fadeIn">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={`/${item.toLowerCase()}`}
                className="block px-4 py-2 text-gray-300 hover:text-teal-400 hover:bg-gray-900/50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/upload"
                prefetch
                className="block px-4 py-2 text-gray-300 hover:text-teal-400 hover:bg-gray-900/50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Upload
              </Link>
            )}
            <div className="px-4 py-2">
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <SignInButton mode="modal">
                  <button className="w-full text-left text-gray-300 hover:text-teal-400 hover:bg-gray-900/50 px-4 py-2 rounded transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default NavBar;
