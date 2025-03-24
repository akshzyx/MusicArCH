"use client";

import Link from "next/link";

import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";

export default function App() {
  return (
    <div className="container mx-auto py-4">
      <Navbar>
        <Link href="/" className="font-bold text-inherit">
          <NavbarBrand>JojiArCH</NavbarBrand>
        </Link>

        <NavbarContent justify="end">
          <Link href="/upload" className="font-bold text-inherit">
            <NavbarItem>Upload</NavbarItem>
          </Link>
        </NavbarContent>
      </Navbar>
    </div>
  );
}
