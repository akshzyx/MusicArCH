"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSkull } from "@fortawesome/free-solid-svg-icons";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs"; // Updated import

const navItems = ["About"];

const NavBar = () => {
  const navContainerRef = useRef(null);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const { isSignedIn, user } = useUser(); // Get user info from Clerk
  const isAdmin = isSignedIn && user?.publicMetadata?.role === "admin"; // Check if admin

  useEffect(() => {
    setIsMounted(true);
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

  if (!isMounted) {
    return null;
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
            <div className="hidden md:block">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={`/${item.toLowerCase()}`}
                  className="text-white mx-3 font-medium hover:text-blue-400"
                >
                  {item}
                </Link>
              ))}
            </div>
            {isAdmin && ( // Show Upload button only to signed-in admins
              <Link
                href="/upload"
                prefetch
                className="ml-10 font-bold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Upload
              </Link>
            )}
            <div className="ml-4">
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <SignInButton mode="modal">
                  <button className="font-bold text-white bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default NavBar;
