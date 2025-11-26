'use client';

import * as React from 'react';
import {
  type DayButton,
  DayPicker,
  getDefaultClassNames,
} from 'react-day-picker';

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
  formatDay?: (date: Date) => string;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatDay,
  formatters,
  components,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      weekStartsOn={1}
      fixedWeeks={true}
      className={cn(
        'bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString('default', { month: 'short' }),
        formatDay: formatDay,
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn(
          'relative flex flex-col sm:flex-row space-y-4 sm:space-x-7 sm:space-y-0',
          defaultClassNames.months
        ),
        month: cn('flex w-full flex-col space-y-4', defaultClassNames.month),
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-normal',
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
          'space-x-1 flex items-center',
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'h-(--cell-size) w-(--cell-size) select-none p-0 opacity-80 hover:opacity-100 aria-disabled:opacity-50 absolute left-1',
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'h-(--cell-size) w-(--cell-size) select-none p-0 opacity-80 hover:opacity-100 aria-disabled:opacity-50 absolute right-1',
          defaultClassNames.button_next
        ),
        month_caption: cn(
          'flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)',
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          'flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium',
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          'has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border',
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          'bg-popover absolute inset-0 opacity-0',
          defaultClassNames.dropdown
        ),

        table: 'w-full border-collapse space-y-[10px]',
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'text-muted-foreground flex-1 select-none rounded-md w-[26px] h-[24px] p-1 m-[4.5px] text-[0.8rem] font-normal',
          defaultClassNames.weekday
        ),
        week: cn('mt-2 flex w-full', defaultClassNames.week),
        week_number_header: cn(
          'w-(--cell-size) select-none',
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          'text-muted-foreground select-none text-[0.8rem]',
          defaultClassNames.week_number
        ),
        day: cn(
          'group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-full [&:last-child[data-selected=true]_button]:rounded--full',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-full [&:has(>.day-range-start)]:rounded-full first:[&:has([aria-selected])]:rounded-full last:[&:has([aria-selected])]:rounded-full'
            : '[&:has([aria-selected])]:rounded-full',
          defaultClassNames.day
        ),
        range_start: cn(
          '!rounded-l-full bg-secondary-blue-500 text-black',
          defaultClassNames.range_start
        ),
        range_middle: cn(
          'bg-secondary-blue-500 text-secondary-blue-50 rounded-none',
          defaultClassNames.range_middle
        ),
        range_end: cn(
          'rounded-l-full bg-secondary-blue-500 text-black',
          defaultClassNames.range_end
        ),
        today: cn(
          'text-primary-green-200 rounded-full border border-primary-green-500 data-[selected=true]:border-none data-[selected=true]:rounded-full',
          defaultClassNames.today
        ),
        outside: cn(
          'text-primary-blue-300 aria-selected:bg-primary-blue-300/50 aria-selected:text-primary-blue-300',
          defaultClassNames.outside
        ),
        disabled: cn(
          'text-muted-foreground opacity-50',
          defaultClassNames.disabled
        ),
        hidden: cn('invisible', defaultClassNames.hidden),
        selected: cn(
          '[&>*]:hover:bg-primary-green-500 [&>*]:hover:text-black !rounded-none',
          classNames
        ),
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeftIcon className={cn('size-4', className)} {...props} />
            );
          }

          if (orientation === 'right') {
            return (
              <ChevronRightIcon
                className={cn('size-4', className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon className={cn('size-4', className)} {...props} />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'h-[27px] w-[27px] p-0 font-normal aria-selected:opacity-100 rounded-full overflow-hidden',
        'hover:bg-primary-green-500 hover:text-black',
        'data-[selected-single=true]:bg-primary-green-500 data-[selected-single=true]:text-black data-[selected-single=true]:rounded-full',
        'data-[range-middle=true]:bg-secondary-blue-500 data-[range-middle=true]:text-secondary-blue-50 data-[range-middle=true]:rounded-none',
        'first:data-[range-middle=true]:rounded-l-full last:data-[range-middle=true]:rounded-r-full',
        'data-[range-start=true]:bg-primary-green-500 data-[range-start=true]:text-black data-[range-start=true]:rounded-full',
        'data-[range-end=true]:bg-primary-green-500 data-[range-end=true]:text-black data-[range-end=true]:rounded-full',
        'group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50',
        'flex aspect-square h-auto w-full min-w-(--cell-size) flex-col gap-1',
        'group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px]',
        '[&>span]:text-xs [&>span]:opacity-70',
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  );
}

export default Calendar;
export { Calendar, CalendarDayButton };
