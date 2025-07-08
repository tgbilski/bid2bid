import { useState, useEffect } from 'react'; // Make sure useEffect is imported
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
  // Function to clean a formatted currency string to just numbers and a dot
  // This is crucial for separating display from raw input.
  const cleanForProcessing = (value: string) => {
    return value.replace(/[^0-9.]/g, '');
  };

  // Local state to manage the input's raw (unformatted) value while typing
  const [localCostValue, setLocalCostValue] = useState('');

  // Use useEffect to synchronize local state with parent prop 'vendor.totalCost'
  // This runs when the component mounts and whenever vendor.totalCost changes from parent.
  useEffect(() => {
    // When vendor.totalCost changes from props, update local state
    // We clean the incoming vendor.totalCost (which might be "$1,234.56")
    // to remove '$', commas, etc., so that editing starts with just the raw number "1234.56".
    setLocalCostValue(cleanForProcessing(vendor.totalCost));
  }, [vendor.totalCost]); // Dependency array: run effect when vendor.totalCost changes


  const formatCurrency = (value: string) => {
    // This function is for final display formatting (e.g., "123.45" -> "$123.45")

    // Clean the value to get only numeric parts (including a decimal)
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    let number = parseFloat(numericValue);

    // KEY FIX: If it's not a valid number (e.g., empty string, just "."), default to 0
    if (isNaN(number) || numericValue === '') {
        number = 0; // Default to 0 for formatting as $0.00
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

    // Allow typing of numbers and a single decimal point
    // This regex allows digits and at most one decimal point
    const sanitizedValue = inputValue.replace(/[^0-9.]/g, '')
                                     .replace(/(\..*)\./g, '$1'); // Only allow one decimal point

    // Update the local state for immediate feedback in the input field
    setLocalCostValue(sanitizedValue);
  };

  const handleCostBlur = () => {
    // When the user leaves the field, format the value for display
    // Ensure that localCostValue is a clean numeric string before formatting
    const cleanedValue = cleanForProcessing(localCostValue); 
    const formatted = formatCurrency(cleanedValue);
    
    // Update parent state with the fully formatted value
    onUpdate(vendor.id, 'totalCost', formatted);
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
              value={localCostValue} // Input displays the raw, editable value
              onChange={handleCostChange} // Updates the raw local state
              onBlur={handleCostBlur} // Formats and updates parent state on blur
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
