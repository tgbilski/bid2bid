
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

export interface VendorData {
  id: string;
  vendorName: string;
  startDate: string;
  jobDuration: string;
  totalCost: string;
}

interface VendorCardProps {
  vendor: VendorData;
  onUpdate: (id: string, field: keyof VendorData, value: string) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

const VendorCard = ({ vendor, onUpdate, onDelete, canDelete }: VendorCardProps) => {
  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    if (numericValue === '') return '';
    const number = parseFloat(numericValue);
    return isNaN(number) ? '' : `$${number.toFixed(2)}`;
  };

  const handleCostChange = (value: string) => {
    const formatted = formatCurrency(value);
    onUpdate(vendor.id, 'totalCost', formatted);
  };

  return (
    <Card className="mb-4 relative">
      <CardContent className="p-4">
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 text-gray-500 hover:text-red-500"
            onClick={() => onDelete(vendor.id)}
          >
            <X size={16} />
          </Button>
        )}
        
        <div className="space-y-4">
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
