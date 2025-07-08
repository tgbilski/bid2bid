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
  totalCost: string; // This will now hold the formatted string, but we'll manage raw input
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
  // Add local state to manage the input's raw value while typing
  const [localCostValue, setLocalCostValue] = useState(vendor.totalCost);

  // Update local state when vendor prop changes (e.g., initial load or parent update)
  // This ensures the input value always reflects the current vendor data.
  // Use useEffect to handle prop changes
  useState(() => {
    setLocalCostValue(vendor.totalCost);
  }, [vendor.totalCost]);


  const formatCurrency = (value: string) => {
    // This function is for final display formatting
    // It should convert a numeric string (e.g., "123.45") to "$123.45"

    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');

    if (numericValue === '' || numericValue === '.') return ''; // Or return "$0.00" if you prefer for empty

    const number = parseFloat(numericValue);
    if (isNaN(number)) return ''; // Or return "$0.00"

    return number.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const cleanForProcessing = (value: string) => {
    // This function takes the displayed value (e.g., "$1,234.56")
    // and returns a raw numeric string (e.g., "1234.56") for internal storage/calculations.
    return value.replace(/[^0-9.]/g, '');
  };


  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow typing of numbers and a single decimal point
    // This regex allows digits and at most one decimal point
    const sanitizedValue = inputValue.replace(/[^0-9.]/g, '')
                                     .replace(/(\..*)\./g, '$1'); // Only allow one decimal point

    // Update the local state for immediate feedback
    setLocalCostValue(sanitizedValue);
  };

  const handleCostBlur = () => {
    // When the user leaves the field, format the value for display
    const formatted = formatCurrency(localCostValue);
    onUpdate(vendor.id, 'totalCost', formatted); // Update parent state with formatted value
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
              value={localCostValue} // Use local state for input value
              onChange={handleCostChange} // Update local state on change
              onBlur={handleCostBlur} // Format and update parent state on blur
              placeholder="$0.00"
              className="mt-1"
              // No maxLength here unless you want to limit the raw number of characters
              // It's usually better to let the currency format handle length after blur
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorCard;
