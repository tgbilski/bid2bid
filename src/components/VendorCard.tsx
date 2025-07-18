
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { X, Heart, Phone } from 'lucide-react';

export interface VendorData {
  id: string;
  vendorName: string;
  phoneNumber?: string;
  startDate: string;
  jobDuration: string;
  totalCost: string; 
  isFavorite?: boolean;
}

interface VendorCardProps {
  vendor: VendorData;
  onUpdate: (id: string, field: keyof VendorData, value: string | boolean) => void;
  onDelete: (id: string) => void;
  onFavorite: (id: string) => void;
  canDelete: boolean;
  favoriteVendors?: VendorData[];
  disabled?: boolean;
}

const VendorCard = ({ vendor, onUpdate, onDelete, onFavorite, canDelete, favoriteVendors = [], disabled = false }: VendorCardProps) => {
  const [localCostValue, setLocalCostValue] = useState('');
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);

  useEffect(() => {
    setLocalCostValue(cleanForProcessing(vendor.totalCost));
  }, [vendor.totalCost]);

  const cleanForProcessing = (value: string) => {
    return value.replace(/[^0-9.]/g, '');
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    let number = parseFloat(numericValue);

    if (isNaN(number) || numericValue === '') {
        number = 0;
    }

    return number.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const sanitizedValue = inputValue.replace(/[^0-9.]/g, '')
                                     .replace(/(\..*)\./g, '$1');
    setLocalCostValue(sanitizedValue);
  };

  const handleCostBlur = () => {
    const cleanedValue = cleanForProcessing(localCostValue); 
    const formatted = formatCurrency(cleanedValue);
    onUpdate(vendor.id, 'totalCost', formatted);
  };

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleVendorNameSelect = (selectedVendor: VendorData) => {
    onUpdate(vendor.id, 'vendorName', selectedVendor.vendorName);
    if (selectedVendor.phoneNumber) {
      onUpdate(vendor.id, 'phoneNumber', selectedVendor.phoneNumber);
    }
    setShowVendorDropdown(false);
  };

  return (
    <Card className={`mb-4 relative transition-colors duration-300 ${
      vendor.isFavorite ? 'bg-green-50 border-green-200' : ''
    }`}>
      <CardContent className="p-4">
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
            onClick={() => onFavorite(vendor.id)}
          >
            <Heart 
              size={16} 
              className={vendor.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'} 
            />
          </Button>
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
              onClick={() => onDelete(vendor.id)}
            >
              <X size={16} />
            </Button>
          )}
        </div>
        
        <div className="space-y-4 pr-16">
          <div className="relative">
            <Label htmlFor={`vendor-name-${vendor.id}`} className="text-black">
              Vendor Name
            </Label>
            <div className="relative">
              <Input
                id={`vendor-name-${vendor.id}`}
                value={vendor.vendorName}
                onChange={(e) => onUpdate(vendor.id, 'vendorName', e.target.value.slice(0, 40))}
                onFocus={() => setShowVendorDropdown(favoriteVendors.length > 0)}
                onBlur={() => setTimeout(() => setShowVendorDropdown(false), 200)}
                placeholder="Enter vendor name"
                maxLength={40}
                className="mt-1"
              />
              {showVendorDropdown && favoriteVendors.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                  {favoriteVendors.map((favVendor) => (
                    <button
                      key={favVendor.id}
                      onClick={() => handleVendorNameSelect(favVendor)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{favVendor.vendorName}</div>
                      {favVendor.phoneNumber && (
                        <div className="text-sm text-gray-500">{favVendor.phoneNumber}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor={`phone-number-${vendor.id}`} className="text-black">
              Vendor Phone Number
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id={`phone-number-${vendor.id}`}
                value={vendor.phoneNumber || ''}
                onChange={(e) => onUpdate(vendor.id, 'phoneNumber', e.target.value)}
                placeholder="Enter phone number"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 p-0"
                onClick={() => handleCall(vendor.phoneNumber || '')}
                disabled={!vendor.phoneNumber}
              >
                <Phone size={16} />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor={`start-date-${vendor.id}`} className="text-black">
              Start Date
            </Label>
            <Input
              id={`start-date-${vendor.id}`}
              type="date"
              value={vendor.startDate}
              onChange={(e) => onUpdate(vendor.id, 'startDate', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor={`job-duration-${vendor.id}`} className="text-black">
              Job Duration
            </Label>
            <Select
              value={vendor.jobDuration}
              onValueChange={(value) => onUpdate(vendor.id, 'jobDuration', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                {[...Array(10)].map((_, i) => (
                  <SelectItem key={i + 1} value={`${i + 1}`}>
                    {i + 1} {i + 1 === 1 ? 'day' : 'days'}
                  </SelectItem>
                ))}
                <SelectItem value="10+">10+ days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`total-cost-${vendor.id}`} className="text-black">
              Total Cost
            </Label>
            <Input
              id={`total-cost-${vendor.id}`}
              value={localCostValue}
              onChange={handleCostChange}
              onBlur={handleCostBlur}
              placeholder="$0.00"
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorCard;
