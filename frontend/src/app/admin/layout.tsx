import "./../globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "tokIT Admin",
  description: "TOKO IT Admin Dashboard",
};

export default function AdminProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )}