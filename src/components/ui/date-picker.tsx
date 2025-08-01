"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";

export function DatePicker() {
  const [date, setDate] = React.useState<Date>(new Date());

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          data-empty={!date}
          className='data-[empty=true]:text-muted-foreground w-[200px] justify-start text-left font-normal'
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {date ? format(date, "yyyy년 M월 d일") : <span>날짜 선택</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={(newDate) => newDate && setDate(newDate)}
        />
      </PopoverContent>
    </Popover>
  );
}
