import "../../globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tokit - Admin Coupon",
  description: "Tokit - Admin Coupon Management",
};

export default function AdminCouponLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}