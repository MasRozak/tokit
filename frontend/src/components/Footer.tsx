import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Image
                src="/tokit.svg"
                alt="tokIT Logo"
                width={120}
                height={60}
                className="w-24 h-12 sm:w-28 sm:h-14"
              />
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Toko elektronik terpercaya dengan kualitas terbaik dan harga terjangkau.
            </p>
          </div>

          {}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/product" className="text-gray-300 hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/6282145665062"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Stuffs</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-300 hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-gray-300 hover:text-white transition-colors">
                  Wishlist
                </Link>
              </li>
              <li>                <Link href="/order" className="text-gray-300 hover:text-white transition-colors">
                  My Order
                </Link>
              </li>
            </ul>
          </div>

          {}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>📍 Surabaya, Indonesia</p>
              <p>📞 +62 821-4566-5062</p>
              <p>🕒 Kalo lagi Bangun</p>
            </div>
          </div>
        </div>

        {}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">            <p className="text-gray-400 text-sm text-center sm:text-left mx-auto">
              &copy; 2025 Kelompok 1 &quot;Tokit&quot;. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
