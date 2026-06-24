import React from 'react';

const AppTable = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto rounded-md border">
      <table ref={ref} className={`w-full caption-bottom text-sm ${className || ''}`} {...props} />
    </div>
  )
);
AppTable.displayName = 'AppTable';

const AppTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={`[&_tr]:border-b bg-muted/50 ${className || ''}`} {...props} />
));
AppTableHeader.displayName = 'AppTableHeader';

const AppTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={`[&_tr:last-child]:border-0 ${className || ''}`} {...props} />
));
AppTableBody.displayName = 'AppTableBody';

const AppTableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={`border-t bg-muted/50 font-medium [&>tr]:last:border-b-0 ${className || ''}`}
    {...props}
  />
));
AppTableFooter.displayName = 'AppTableFooter';

const AppTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className || ''}`}
    {...props}
  />
));
AppTableRow.displayName = 'AppTableRow';

const AppTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className || ''}`}
    {...props}
  />
));
AppTableHead.displayName = 'AppTableHead';

const AppTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className || ''}`}
    {...props}
  />
));
AppTableCell.displayName = 'AppTableCell';

const AppTableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={`mt-4 text-sm text-muted-foreground ${className || ''}`}
    {...props}
  />
));
AppTableCaption.displayName = 'AppTableCaption';

export {
  AppTable,
  AppTableBody,
  AppTableCaption,
  AppTableCell,
  AppTableFooter,
  AppTableHead,
  AppTableHeader,
  AppTableRow,
};
