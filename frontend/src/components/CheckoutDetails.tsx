
'use client';
import React, { useState } from 'react';

type CheckoutItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
};

type Props = {
  items: CheckoutItem[];
  onPlaceOrder?: (paymentMethod: string, couponCode?: string, discountAmount?: number) => void;
  isLoading?: boolean;
};

const CheckoutDetails: React.FC<Props> = ({ items, onPlaceOrder, isLoading = false }) => {
  const [paymentMethod, setPaymentMethod] = useState('transfer bank');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; discount: number } | null>(null);
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping: number = 0;
  const discount = couponDiscount;  const total = subtotal + shipping - discount;

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponValidating(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kode_kupon: couponCode }),
      });

      const data = await response.json();      if (response.ok) {
        const discountAmount = (subtotal * data.data.diskon) / 100;
        setCouponDiscount(discountAmount);
        setAppliedCoupon({
          id: data.data.id_kupon,
          code: data.data.kode_kupon,
          discount: data.data.diskon
        });
        setCouponSuccess(`Coupon applied! ${data.data.diskon}% discount`);
      } else {
        setCouponError(data.error || 'Invalid coupon code');
        setCouponDiscount(0);
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError('Failed to validate coupon. Please try again.');
      setCouponDiscount(0);
      setAppliedCoupon(null);
    } finally {
      setCouponValidating(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setAppliedCoupon(null);
    setCouponError('');
    setCouponSuccess('');
  };
  const handlePlaceOrder = () => {
    if (onPlaceOrder) {
      onPlaceOrder(paymentMethod, appliedCoupon?.code, couponDiscount);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>

      {}
      <div className="space-y-4 mb-6">
        {items.map(item => (
          <div key={item.id} className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            </div>
            <div className="text-right">              <p className="text-sm font-medium text-gray-900">
                Rp. {(item.price * item.quantity).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Method</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="transfer_bank"              checked={paymentMethod === 'transfer bank'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Bank Transfer</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="cod"              checked={paymentMethod === 'cod'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Cash on Delivery</span>
          </label>
        </div>
      </div>      {}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Coupon Code</h3>

        {!appliedCoupon ? (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponError('');
                  setCouponSuccess('');
                }}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm ${
                  couponError                    ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                disabled={couponValidating}
              />
              <button
                type="button"
                onClick={validateCoupon}
                disabled={couponValidating || !couponCode.trim()}
                className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                  couponValidating || !couponCode.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {couponValidating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                    Checking...
                  </div>
                ) : (
                  'Apply'
                )}
              </button>
            </div>

            {couponError && (
              <p className="text-xs text-blue-600 mt-1">{couponError}</p>
            )}

            {couponSuccess && (
              <p className="text-xs text-green-600 mt-1">{couponSuccess}</p>
            )}
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">
                  {appliedCoupon.code} Applied
                </p>
                <p className="text-xs text-green-600">
                  {appliedCoupon.discount}% discount
                </p>
              </div>
              <button
                type="button"
                onClick={removeCoupon}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium">Rp. {subtotal.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping:</span>
          <span className="font-medium">{shipping === 0 ? 'Free' : `Rp. ${shipping.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount:</span>
            <span className="font-medium">-Rp. {discount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        )}

        <hr className="my-2" />

        <div className="flex justify-between font-semibold text-lg">
          <span>Total:</span>
          <span className="text-blue-600">Rp. {total.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {}
      <button
        onClick={handlePlaceOrder}
        disabled={isLoading || items.length === 0}
        className={`w-full mt-6 px-6 py-3 rounded-md font-medium transition-colors ${
          isLoading || items.length === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          `Place Order - Rp. ${total.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        )}
      </button>

      {}
      <p className="text-xs text-gray-500 text-center mt-4">
        Your payment information is secure and encrypted
      </p>
    </div>
  );
};

export default CheckoutDetails;
