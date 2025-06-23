'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ShipmentDetails from '../../components/ShipmentDetails';
import CheckoutDetails from '../../components/CheckoutDetails';
import RequireAuth from '../../components/RequireAuth';

interface CartItem {
  product_id: string;
  qty: number;
  product_name: string;
  price: number;
  image?: string;
  description?: string;
  stock: number;
}

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface ShipmentDetail {
  id_shipment: string;
  first_name: string;
  last_name?: string;
  street_address: string;
  apartment_floor?: string;
  kota: string;
  phone_number: string;
  kode_pos: string;
  label?: string;
}

export default function Checkout() {  const [cartItems, setCartItems] = useState<CheckoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<ShipmentDetail | null>(null);
  const router = useRouter();

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('jwtToken');
    }
    return null;
  };

  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setError('Please login to view cart');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/cart`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Please login again - your session may have expired');
          }
          if (response.status === 404) {

            setCartItems([]);
            setLoading(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }        const data = await response.json();
        console.log('Cart data from backend:', data);

        if (data.produk && Array.isArray(data.produk)) {          const checkoutItems: CheckoutItem[] = data.produk.map((item: { product_id: string; name?: string; product_name?: string; price?: number; image?: string; qty?: number; stock?: number }) => ({
            id: item.product_id,
            name: item.name || item.product_name || 'Unknown Product',
            price: item.price || 0,
            image: item.image || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
            quantity: item.qty || 0,
            stock: item.stock || 0
          }));
          setCartItems(checkoutItems);
        } else if (data.success && data.cart?.produk) {

          const checkoutItems: CheckoutItem[] = data.cart.produk.map((item: CartItem) => ({
            id: item.product_id,
            name: item.product_name,
            price: item.price,
            image: item.image || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
            quantity: item.qty,
            stock: item.stock
          }));
          setCartItems(checkoutItems);
        } else {
          console.log('No products found in cart data:', data);
          setCartItems([]);
        }

      } catch (error) {
        console.error('Error loading cart:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to load cart');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);
  const handlePlaceOrder = async (paymentMethod: string, couponCode?: string, discountAmount?: number) => {
    setIsPlacingOrder(true);
    setError(null);

    const token = getAuthToken();
    if (!token) {
      setError('Please login to place order');
      setIsPlacingOrder(false);
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      setIsPlacingOrder(false);
      return;
    }    if (!selectedAddress) {
      setError('Please select a shipping address');
      setIsPlacingOrder(false);
      return;
    }    try {

      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const finalTotal = discountAmount ? subtotal - discountAmount : subtotal;

      const orderDetails = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const orderPayload = {
        order_details: orderDetails,
        id_shipment: selectedAddress.id_shipment,
        metode_pembayaran: paymentMethod,
        total: finalTotal,
        ...(couponCode && { kode_kupon: couponCode })
      };

      console.log('Creating order with payload:', orderPayload);

      const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();
      console.log('Order created successfully:', orderData);

      router.push(`/order/${orderData.order.id_order}`);

    } catch (error) {
      console.error('Error placing order:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to place order');
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Error Loading Cart</h2>
          <p className="text-gray-600 mb-8">{error}</p>          <button
            onClick={() => router.push('/cart')}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some items to your cart before checkout</p>          <button
            onClick={() => router.push('/product')}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600">Review your order and complete your purchase</p>
          </div>

          {}
          {error && (            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-600 text-sm">{error}</p>
            </div>
          )}          {}
          <div className="flex flex-col lg:flex-row gap-8">
            <ShipmentDetails onAddressSelect={(address) => setSelectedAddress(address)} />
            <CheckoutDetails
              items={cartItems}
              onPlaceOrder={handlePlaceOrder}
              isLoading={isPlacingOrder}
            />
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
