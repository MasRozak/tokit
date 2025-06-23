
'use client';
import React, { useState, useEffect } from 'react';

interface ShipmentDetail {
  id_shipment: string;
  first_name: string;
  last_name?: string;
  street_address: string;
  apartment_floor?: string;
  kota: string;
  phone_number: string;
  email_address: string;
  kode_pos: string;
  label?: string;
}

const ShipmentDetails = () => {
  const [savedAddresses, setSavedAddresses] = useState<ShipmentDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
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
        const response = await fetch('http://localhost:3001/api/shipments', {
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

      } catch (error) {
        console.error('Error loading shipment details:', error);
        setError('Failed to load saved addresses');
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedAddresses();
  }, []);

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

      {error && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <p>Component loaded successfully!</p>
        <p>Saved addresses: {savedAddresses.length}</p>
        {error && <p className="text-blue-500">Error: {error}</p>}
      </div>
    </div>
  );
};

export default ShipmentDetails;
