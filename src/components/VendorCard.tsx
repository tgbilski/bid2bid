
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { X, Heart } from 'lucide-react';

export interface VendorData {
  id: string;
  vendorName: string;
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
}

const VendorCard = ({ vendor, onUpdate, onDelete, onFavorite, canDelete }: VendorCardProps) => {
  const formatCurrency = (value: string) => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Handle empty string
    if (numericValue === '' || numericValue === '.') return '';
    
    // Parse the number
    const number = parseFloat(numericValue);
    if (isNaN(number)) return '';
    
    // Format to currency
    return number.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleCostChange = (value: string) => {
    const formatted = formatCurrency(value);
    onUpdate(vendor.id, 'totalCost', formatted);
  };

  const handleCostBlur = () => {
    // Ensure proper formatting on blur
    if (vendor.totalCost && vendor.totalCost !== '$0.00') {
      const formatted = formatCurrency(vendor.totalCost);
      if (formatted !== vendor.totalCost) {
        onUpdate(vendor.id, 'totalCost', formatted);
      }
    }
  };

  return (
    <Card className="mb-4 relative">
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
          <div>
            <Label htmlFor={`vendor-name-${vendor.id}`} className="text-black">
              Vendor Name
            </Label>
            <Input
              id={`vendor-name-${vendor.id}`}
              value={vendor.vendorName}
              onChange={(e) => onUpdate(vendor.id, 'vendorName', e.target.value.slice(0, 40))}
              placeholder="Enter vendor name"
              maxLength={40}
              className="mt-1"
            />
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
              value={vendor.totalCost}
              onChange={(e) => handleCostChange(e.target.value)}
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
