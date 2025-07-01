import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

const COUNTIES = [
  "Bomet", "Kiambu", "Kisii", "Meru", "Nakuru", "Kakamega", "Machakos", "Kericho", "Nyeri", "Kitui", "Narok", "Kilifi", "Murang'a", "Elgeyo-Marakwet", "Mombasa", "Uasin Gishu", "Turkana", "Nairobi"
];

const PRODUCE_TYPES = [
  "Avocado", "Mango", "Banana", "Pineapple", "Coffee", "Tea", "Macadamia", "French Beans", "Snow Peas", "Passion Fruit", "Maize", "Beans", "Dairy", "Wheat", "Barley", "Sugarcane", "Cashew", "Coconut", "Potatoes", "Vegetables", "Poultry", "Fish", "Goats", "Camels", "Sheep", "Aloe vera", "Pigeon peas", "Sorghum", "Macadamia", "Green grams", "Cowpeas"
];

export default function FarmerFilters({ filters, onChange, onClear }) {
  const [county, setCounty] = useState(filters.county || "");
  const [minAcreage, setMinAcreage] = useState(filters.minAcreage || "");
  const [maxAcreage, setMaxAcreage] = useState(filters.maxAcreage || "");
  const [produce, setProduce] = useState(filters.produce || []);
  const [produceOpen, setProduceOpen] = useState(false);

  const handleProduceChange = (item) => {
    setProduce((prev) =>
      prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]
    );
  };

  // Emit changes upward
  React.useEffect(() => {
    onChange({ county, minAcreage, maxAcreage, produce });
    // eslint-disable-next-line
  }, [county, minAcreage, maxAcreage, produce]);

  const handleClear = () => {
    setCounty("");
    setMinAcreage("");
    setMaxAcreage("");
    setProduce([]);
    onClear && onClear();
  };

  return (
    <div className="w-full flex flex-col md:flex-row md:items-end gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      {/* County Dropdown */}
      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-medium mb-1">County</label>
        <Select value={county} onValueChange={setCounty}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select county" />
          </SelectTrigger>
          <SelectContent>
            {COUNTIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Acreage Min/Max */}
      <div className="flex flex-1 gap-2 min-w-[120px]">
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1">Min Acreage</label>
          <Input
            type="number"
            min={0}
            value={minAcreage}
            onChange={e => setMinAcreage(e.target.value)}
            placeholder="Min"
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1">Max Acreage</label>
          <Input
            type="number"
            min={0}
            value={maxAcreage}
            onChange={e => setMaxAcreage(e.target.value)}
            placeholder="Max"
            className="w-full"
          />
        </div>
      </div>
      {/* Produce Multi-select */}
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs font-medium mb-1">Produce</label>
        <Popover open={produceOpen} onOpenChange={setProduceOpen}>
          <SelectTrigger className="w-full" onClick={() => setProduceOpen(!produceOpen)}>
            <span className="truncate">{produce.length ? produce.join(", ") : "Select produce"}</span>
          </SelectTrigger>
          {produceOpen && (
            <SelectContent className="max-h-60 overflow-y-auto w-full bg-white z-50 border rounded shadow-lg p-2">
              {PRODUCE_TYPES.map((item) => (
                <div key={item} className="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 rounded cursor-pointer" onClick={() => handleProduceChange(item)}>
                  <Checkbox checked={produce.includes(item)} readOnly />
                  <span className="text-xs">{item}</span>
                </div>
              ))}
            </SelectContent>
          )}
        </Popover>
      </div>
      {/* Clear Button */}
      <div className="flex-shrink-0">
        <Button variant="outline" className="w-full" onClick={handleClear} type="button">
          Clear Filters
        </Button>
      </div>
    </div>
  );
} 