"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSkull } from "@fortawesome/free-solid-svg-icons"; // Replacing GiPirateSkull

const navItems = ["Nexus", "Vault", "Prologue", "About", "Contact"];

const NavBar = () => {
  const navContainerRef = useRef(null);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
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

  return (
    <div
      ref={navContainerRef}
      className={`fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-300 sm:inset-x-6 ${
        isNavVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
      }`}
    >
      <header className="absolute top-1/2 w-full -translate-y-1/2">
        <nav className="flex size-full items-center justify-between p-4 bg-black rounded-lg shadow-lg">
          {/* Logo and Title */}
          <div className="flex items-center gap-7">
            {/* <GiPirateSkull size={40} color="white" /> */}
            <FontAwesomeIcon icon={faSkull} size="2x" color="white" />

            <p className="font-bold text-white">JojiArCH</p>
          </div>

          {/* Navigation Links and Upload Button */}
          <div className="flex h-full items-center">
            <div className="hidden md:block">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={`#${item.toLowerCase()}`}
                  className="text-white mx-3 font-medium hover:text-blue-400"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Upload Button */}
            <Link
              href="/upload"
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
