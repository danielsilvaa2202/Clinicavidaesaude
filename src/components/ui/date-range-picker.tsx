"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: Date;
  to: Date;
}

interface Props {
  value: DateRange;
  onChange(r: DateRange): void;
  className?: string;
}

export const DateRangePicker = ({ value, onChange, className }: Props) => {
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({ from: value.from, to: value.to });
  useEffect(() => setRange(value), [value]);
  const handleSelect = (r: any) => {
    if (!r) return;
    setRange(r);
    if (r.from && r.to) onChange({ from: r.from, to: r.to });
  };
  const label =
    range.from && range.to
      ? `${format(range.from, "PPP", { locale: ptBR })} – ${format(range.to, "PPP", { locale: ptBR })}`
      : "Selecione o período";
  const refMonth = value.to ?? new Date();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-[320px] justify-start font-normal", className)}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          locale={ptBR}
          mode="range"
          numberOfMonths={2}
          defaultMonth={new Date(refMonth.getFullYear(), refMonth.getMonth() - 1, 1)}
          selected={range as any}
          onSelect={handleSelect}
          initialFocus
          classNames={{
            day_range_start: "bg-primary/30 text-primary-foreground",
            day_range_end: "bg-primary/30 text-primary-foreground",
            day_range_middle: "bg-primary/10 text-primary-foreground",
            day_selected: "bg-primary/60 text-primary-foreground",
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
