"use client";

import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MonthYearPickerProps {
  onChange: (month: number, year: number) => void;
}

export function MonthYearPicker({ onChange }: Readonly<MonthYearPickerProps>) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  const handleMonthChange = (newMonth: number) => {
    setMonth(newMonth);
    onChange(newMonth, year);
  };

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    onChange(month, newYear);
  };

  return (
    <div className="flex space-x-2 md:w-96 w-full">
      <Select
        value={month.toString()}
        onValueChange={(value) => handleMonthChange(parseInt(value, 10))}
      >
        <SelectTrigger className="border p-2">
          <SelectValue placeholder="Select month" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <SelectItem key={m} value={m.toString()}>
              {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={year.toString()}
        onValueChange={(value) => handleYearChange(parseInt(value, 10))}
      >
        <SelectTrigger className="border p-2">
          <SelectValue placeholder="Select year" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
