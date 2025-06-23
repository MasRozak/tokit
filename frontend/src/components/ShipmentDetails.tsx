
'use client';
import React, { useState, useEffect } from 'react';
import { FiMapPin, FiPhone, FiPlus, FiCheck } from 'react-icons/fi';

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

interface Props {
  onAddressSelect?: (address: ShipmentDetail | null) => void;
}

const ShipmentDetails: React.FC<Props> = ({ onAddressSelect }) => {const [savedAddresses, setSavedAddresses] = useState<ShipmentDetail[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    street_address: '',
    apartment_floor: '',
    kota: '',
    phone_number: '',
    kode_pos: '',
    label: ''
  });

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('jwtToken');
    }
    return null;
  };

  useEffect(() => {
    const loadSavedAddresses = async () => {
      setIsLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setError('Please login to view saved addresses');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/shipments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSavedAddresses(data.data || []);

        if (data.data && data.data.length > 0) {
          setSelectedAddressId(data.data[0].id_shipment);
        }

      } catch (error) {
        console.error('Error loading shipment details:', error);
        setError('Failed to load saved addresses');
      } finally {
        setIsLoading(false);
      }
    };    loadSavedAddresses();
  }, []);

  useEffect(() => {
    const selectedAddress = savedAddresses.find(addr => addr.id_shipment === selectedAddressId);
    if (onAddressSelect) {
      onAddressSelect(selectedAddress || null);
    }
  }, [selectedAddressId, savedAddresses, onAddressSelect]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = getAuthToken();
    if (!token) {
      setError('Please login to save address');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/shipments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save address');
      }

      const data = await response.json();
      const newAddress = data.data;

      setSavedAddresses(prev => [...prev, newAddress]);
      setSelectedAddressId(newAddress.id_shipment);
      setShowForm(false);

      setForm({
        first_name: '',
        last_name: '',
        street_address: '',
        apartment_floor: '',
        kota: '',
        phone_number: '',
        kode_pos: '',
        label: ''
      });

    } catch (error) {
      console.error('Error saving address:', error);
      setError(error instanceof Error ? error.message : 'Failed to save address');
    }
  };

  const selectedAddress = savedAddresses.find(addr => addr.id_shipment === selectedAddressId);

  if (isLoading) {
    return (
      <div className="w-full max-w-md px-4 sm:px-10">
        <h2 className="text-xl sm:text-2xl font-semibold mb-6">Shipment Details</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full max-w-md px-4 sm:px-10">
      <h2 className="text-xl sm:text-2xl font-semibold mb-6">Shipment Details</h2>

      {}
      {error && (        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-600 text-sm">{error}</p>
        </div>
      )}

      {}
      {savedAddresses.length > 0 && !showForm && (
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700">Choose Address:</h3>
            {savedAddresses.map((address) => (
            <div
              key={address.id_shipment}
              onClick={() => setSelectedAddressId(address.id_shipment)}
              className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedAddressId === address.id_shipment
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {}
              <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedAddressId === address.id_shipment
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {selectedAddressId === address.id_shipment && (
                  <FiCheck className="w-3 h-3 text-white" />
                )}
              </div>

              {}
              <div className="pr-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900">
                    {address.first_name} {address.last_name}
                  </span>
                  {address.label && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      {address.label}
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      {address.street_address}
                      {address.apartment_floor && `, ${address.apartment_floor}`}
                      <br />
                      {address.kota} {address.kode_pos}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiPhone className="w-4 h-4 flex-shrink-0" />
                    <span>{address.phone_number}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {}
          <button
            onClick={() => setShowForm(true)}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-gray-700"
          >
            <FiPlus className="w-4 h-4" />
            Add New Address
          </button>
        </div>
      )}

      {}
      {(showForm || savedAddresses.length === 0) && (        <form onSubmit={handleSubmitNewAddress} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="First Name*"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Last Name"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <input
            name="street_address"
            value={form.street_address}
            onChange={handleChange}
            placeholder="Street Address*"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />

          <input
            name="apartment_floor"
            value={form.apartment_floor}
            onChange={handleChange}
            placeholder="Apartment, floor, etc. (optional)"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="kota"
              value={form.kota}
              onChange={handleChange}
              placeholder="Town/City*"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              name="kode_pos"
              value={form.kode_pos}
              onChange={handleChange}
              placeholder="Postal Code*"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <input
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            placeholder="Phone Number*"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />

          <input
            name="label"
            value={form.label}
            onChange={handleChange}
            placeholder="Label (Home, Office)"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="flex gap-3 pt-4">
            {savedAddresses.length > 0 && (
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {savedAddresses.length === 0 ? 'Continue' : 'Add Address'}
            </button>
          </div>
        </form>
      )}      {}
      {selectedAddress && !showForm && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Selected Address:</h4>
          <p className="text-sm text-green-700">
            {selectedAddress.first_name} {selectedAddress.last_name}<br />
            {selectedAddress.street_address}{selectedAddress.apartment_floor && `, ${selectedAddress.apartment_floor}`}<br />
            {selectedAddress.kota} {selectedAddress.kode_pos}<br />
            {selectedAddress.phone_number}
          </p>        </div>
      )}
    </div>
  );
};

export default ShipmentDetails;
