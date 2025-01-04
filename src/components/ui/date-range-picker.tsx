"use client";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import { useState } from "react";
import { DateRangePicker as ReactDateRangePicker } from "react-date-range";

interface DateRangePickerProps {
  onChange: (range: { startDate: Date | null; endDate: Date | null }) => void;
}

export function DateRangePicker({ onChange }: DateRangePickerProps) {
  const [range, setRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: "selection" },
  ]);

  const handleSelect = (ranges: any) => {
    const { startDate, endDate } = ranges.selection;
    setRange([ranges.selection]);
    onChange({ startDate, endDate });
  };

  return (
    <ReactDateRangePicker
      ranges={range}
      onChange={handleSelect}
      moveRangeOnFirstSelection={false}
      rangeColors={["#0070f3"]}
    />
  );
}
