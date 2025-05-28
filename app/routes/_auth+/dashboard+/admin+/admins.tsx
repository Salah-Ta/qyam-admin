import React, { useState } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { type ClassValue, clsx } from "clsx";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import HorizontalTabs from "./horizontalTabs";

// Utility function
const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

// Badge component
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
};

// Button component
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Card component
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

// Checkbox component
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4  shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <CheckIcon className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

// Pagination components
const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontalIcon className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

// Table components
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn(className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn(" ", className)} {...props} />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn("h-10 px-2 text-left align-middle font-medium ", className)}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("  ", className)} {...props} />
));
TableCell.displayName = "TableCell";

// Data for the metrics cards
const metricsData = [
  {
    id: 1,
    title: "عدد الإداريين",
    value: "50",
    icon: <UserIcon className="h-5 w-5" />,
  },
  {
    id: 2,
    title: "عدد المشرفين",
    value: "10",
    icon: <UserIcon className="h-5 w-5" />,
  },
  {
    id: 3,
    title: "عدد الإدارات",
    value: "15",
    icon: <UserIcon className="h-5 w-5" />,
  },
];

export const Users = (): JSX.Element => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Data for table rows
  const allTableData = Array(100)
    .fill(null)
    .map((_, index) => ({
      name: `أحمد الإداري ${index + 1}`,
      mobile: "96655186620",
      email: `admin${index + 1}@example.com`,
      account: "إداري",
      region: "الرياض",
      department: "الإدارة العامة",
      school: "غير متوفر",
      status: "نشط",
      isChecked: index === 0,
    }));

  const totalPages = Math.ceil(allTableData.length / itemsPerPage);

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allTableData.slice(startIndex, endIndex);
  };

  // Action badges data
  const actionBadges = [
    { label: "مقبول", color: "#1a7f37", borderColor: "#1a7f37" },
    { label: "مرفوض", color: "#bc4c00", borderColor: "#bc4c00" },
    { label: "غير نشط", color: "#9a6700", borderColor: "#bf8700" },
  ];

  // SearchIcon tags data
  const searchTags = Array(3).fill({ label: "label" });

  return (
    <div className="w-full   mx-auto ">
     
      <Card className="w-full rounded-2xl border border-gray-300 overflow-hidden max-w-full lg:px-[42px]">
        <div className="flex flex-col w-full max-lg:p-6 pt-6">
          {/* Metrics Overview Section */}
          <section className="flex flex-wrap gap-5 w-full">
            {metricsData.map((metric) => (
              <Card
                key={metric.id}
                className="flex-1 min-w-[232px] border border-[#e9e9eb] shadow-shadows-shadow-xs"
              >
                <CardContent className="flex items-start justify-between p-5 gap-3 [direction:rtl]">
                  <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg overflow-hidden border border-[#e9e9eb] shadow-shadows-shadow-xs-skeuomorphic flex items-center justify-center">
                    {metric.icon}
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <h3 className="self-stretch   font-medium text-[#535861] text-sm tracking-[0] leading-5  w-full">
                      {metric.title}
                    </h3>
                    <p className="  font-bold text-[#181d27] text-3xl  tracking-[0] leading-[38px]">
                      {metric.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

      {/* Main Content Section */}
      <section className="flex flex-col w-full mt-20">
        <div className="relative w-full">
          {/* Top controls - Responsive */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 [direction:rtl] gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 ml-4 [direction:rtl] w-full md:w-auto">
              <div className="text-gray-700 text-sm font-bold whitespace-nowrap">
                تم تحديد : 43
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-solid border-[#cfd4dc] text-[#12b669] font-bold shadow-shadow-xs-focused-4px-gray-100 w-full sm:w-auto"
                >
                  <img
                    className="w-[19.5px] h-[19.5px]"
                    alt="Accept icon"
                    src="https://c.animaapp.com/m9qfyf0iFAAeZK/img/group-30535.png"
                  />
                  قبول
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-solid border-[#cfd4dc] text-[#d1242f] font-bold w-full sm:w-auto"
                >
                  <img
                    className="w-[19.5px] h-[19.5px]"
                    alt="Reject icon"
                    src="https://c.animaapp.com/m9qfyf0iFAAeZK/img/group-30535-1.png"
                  />
                  رفض
                </Button>
              </div>
            </div>

            <div className="w-full md:max-w-[544px]">
              <div className="flex flex-col w-full gap-1.5">
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white rounded-lg border border-solid border-[#cfd4dc] shadow-shadow-xs">
                  <div className="flex items-center gap-2 flex-1">
                    <SearchIcon className="w-5 h-5 text-[#475467]" />
                    <span className="text-gray-500 text-base">بحث</span>
                  </div>
                  <div className="hidden sm:flex gap-2">
                    {actionBadges.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="px-2.5 py-[3px] rounded-lg border border-solid border-[#e5e7ea] font-body-small-bold text-[#475467]"
                      >
                        {tag.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <img
            className="w-full h-px object-cover mt-6 mb-3"
            alt="Divider"
            src="https://c.animaapp.com/m9qfyf0iFAAeZK/img/vector-9.svg"
          />
              {/* Table */}
              <div className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="mb-4 border-[#e4e7ec]  ">
                      {/* <TableHead className="text-right pr-2">
                        <span className="sr-only">Select</span>
                      </TableHead> */}

                      <TableHead className="text-center   font-medium text-gray-700 text-[15px] ">
                        الإجراء
                      </TableHead>
                      <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px] max-md:hidden  ">
                        حالة التسجيل
                      </TableHead>
                      <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px] max-md:hidden">
                        المدرسة
                      </TableHead>
                      <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px] max-md:hidden">
                        الإدارة
                      </TableHead>
                      <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px] max-md:hidden">
                        المنطقة
                      </TableHead>
                      <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px] max-md:hidden">
                        الحساب
                      </TableHead>
                      <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px] max-md:hidden">
                        البريد الإلكتروني
                      </TableHead>
                      <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px] max-md:hidden">
                        الجوال
                      </TableHead>
                      <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px]">
                        الاسم
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentPageData().map((row, index) => (
                      <TableRow
                        key={index}
                        className="border-b border-[#e4e7ec] "
                      >
                        <TableCell className="py-1 px-2 mt-4">
                          <div className="flex items-center gap-3.5">
                            {actionBadges.map((badge, badgeIndex) => (
                              <Badge
                                key={badgeIndex}
                                className={`px-2.5 py-[3px] rounded-[100px] border border-solid bg-transparent`}
                                style={{ borderColor: badge.borderColor }}
                              >
                                <span
                                  className=" font-bold text-xs [direction:rtl]"
                                  style={{ color: badge.color }}
                                >
                                  {badge.label}
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-right max-md:hidden">
                          <Badge className="px-2.5 py-[3px] rounded-[100px] border border-solid border-[#1a7f37] bg-transparent">
                            <span className=" font-bold text-[#1a7f37] text-xs [direction:rtl]">
                              {row.status}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-right max-md:hidden">
                          <span className=" font-medium text-[#027163] text-base [direction:rtl]">
                            {row.school}
                          </span>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-right max-md:hidden">
                          <span className=" font-medium text-[#027163] text-base [direction:rtl]">
                            {row.department}
                          </span>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-right max-md:hidden">
                          <span className=" font-medium text-[#027163] text-base [direction:rtl]">
                            {row.region}
                          </span>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-right max-md:hidden">
                          <span className=" font-medium text-[#027163] text-base [direction:rtl]">
                            {row.account}
                          </span>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-right max-md:hidden">
                          <span className="font-medium text-[#027163] text-base">
                            {row.email}
                          </span>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-right max-md:hidden">
                          <span className="font-medium text-[#027163] text-base">
                            {row.mobile}
                          </span>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-right  ">
                          <span className=" font-medium text-[#027163] text-base [direction:rtl] mr-[23px]">
                            {row.name}
                          </span>
                        </TableCell>
                        <TableCell className="  ">
                          <Checkbox
                            checked={row.isChecked}
                            className={
                              row.isChecked
                                ? "w-4 h-4 bg-[#0969da] rounded-[3px] "
                                : "w-4 h-4 bg-[#ffffff] rounded-[3px] border border-solid border-[#868f99]"
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
                <div className="flex justify-center items-center pt-3 pb-4 px-6 border-t border-[#e4e7ec] mt-4">
                  <Pagination>
                    <PaginationContent className="shadow-shadow-xs">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-[8px_0px_0px_8px] border border-solid border-[#cfd4dc]"
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ArrowLeftIcon className="w-5 h-5" />
                        <span className=" font-bold text-sm [direction:rtl]">
                          السابق
                        </span>
                      </Button>

                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 &&
                            pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem
                              key={pageNumber}
                              className={
                                pageNumber === currentPage ? "bg-gray-50" : ""
                              }
                            >
                              <PaginationLink
                                className="w-10 h-10 flex items-center justify-center border-t border-b border-[#cfd4dc] font-medium"
                                onClick={() => setCurrentPage(pageNumber)}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          (pageNumber === currentPage - 2 && currentPage > 3) ||
                          (pageNumber === currentPage + 2 &&
                            currentPage < totalPages - 2)
                        ) {
                          return (
                            <PaginationEllipsis
                              key={pageNumber}
                              className="w-10 h-10 flex items-center justify-center border-t border-b border-[#cfd4dc]"
                            />
                          );
                        }
                        return null;
                      })}

                      <Button
                        variant="outline"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-[0px_8px_8px_0px] border border-solid border-[#cfd4dc]"
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        <span className=" font-bold  text-sm [direction:rtl]">
                          التالي
                        </span>
                        <ArrowRightIcon className="w-5 h-5" />
                      </Button>
                    </PaginationContent>
                  </Pagination>
                </div>
            </div>
          </section>
        </div>
      </Card>
    </div>
  );
};
export default Users;
