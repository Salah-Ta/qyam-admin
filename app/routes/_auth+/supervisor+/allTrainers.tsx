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
import { useNavigate, useNavigation } from "@remix-run/react";
import squareArrow from "../../../assets/icons/square-arrow-right.svg";
// Utility function
const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

// Badge component
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary  shadow ",
        secondary: "border-transparent bg-secondary ",
        destructive: "border-transparent bg-destructive ",
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
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ",
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
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
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
    className={cn("flex flex-row items-center ", className)}
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
    className={cn("h-10   text-left   font-medium ", className)}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("py-2   ", className)} {...props} />
));
TableCell.displayName = "TableCell";

// Data for the metrics cards
const metricsData = [
  {
    id: 1,
    title: "عدد المتدربات",
    value: "5000",
    icon: <UserIcon className="h-5 w-5" />,
  },
  {
    id: 2,
    title: "عدد المشرفين",
    value: "4",
    icon: <UserIcon className="h-5 w-5" />,
  },
  {
    id: 3,
    title: "عدد المدربين",
    value: "200",
    icon: <UserIcon className="h-5 w-5" />,
  },
];

export const AllTrainers = (): JSX.Element => {
  const navigate = useNavigate();
  const navigation = useNavigation();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Data for table rows
  const allTableData = Array(100)
    .fill(null)
    .map((_, index) => ({
      name: `محمد منصور ${index + 1}`,
      mobile: "96655186620",
      email: `Hasf${index + 1}@gmail.com`,
      account: "مشرف",
      region: "الرياض",
      department: "الزلفي",
      school: "خالد بن الوليد",
      status: "عرض",
      isChecked: index === 0,
    }));

  const totalPages = Math.ceil(allTableData.length / itemsPerPage);

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allTableData.slice(startIndex, endIndex);
  };

  // SearchIcon tags data
  const searchTags = Array(3).fill({ label: "label" });

  return (
    <div className="bg-[#f8f9fa]">
      <div className="w-full  max-w-full max-xl:px-[22px]  xl:px-[112px] mx-auto py-6 mb-[76px]">
        <div className="flex   justify-between items-baseline w-full   mx-auto py-6  rounded-xl  [direction:rtl] ">
          {/* Header Section */}
          <div className="flex flex-col items-start mb-6  pb-4 max-md:m-5">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              إحصاءات المدربين
            </h1>
            <p className="text-lg font-normal text-[#535862]">
              اختر مدرب لعرض الإحصاءات
            </p>
          </div>
          <button onClick={() => navigate("/")}>
            <img className="" alt="Group" src={squareArrow} />
          </button>
        </div>

        <Card className="w-full rounded-2xl border border-gray-300 overflow-hidden mb-[140px]">
          <div className="flex flex-col w-full p-12">
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
                      <h3 className="self-stretch  font-medium text-[#535861] text-sm tracking-[0] leading-5  w-full">
                        {metric.title}
                      </h3>
                      <p className=" font-bold text-[#181d27] text-3xl  tracking-[0] leading-[38px]">
                        {metric.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>

            {/* Main Content Section */}
            <section className="flex flex-col w-full mt-20 ">
              <div className="relative w-full  ">
                {/* Top controls */}
                <div className="flex justify-end items-end mb-6 [direction:rtl]  ">
                  <div className="w-full max-w-[544px]">
                    <div className="flex flex-col w-full gap-1.5">
                      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white rounded-lg border border-solid border-[#cfd4dc] shadow-shadow-xs">
                        <div className="flex items-center  gap-2 flex-1">
                          <SearchIcon className="w-5 h-5 text-[#475467] " />
                          <span className="text-gray-500 text-base  ">بحث</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="mb-4 border-b border-[#E4E7EC]  ">
                        {/* <TableHead className="text-right pr-2">
                        <span className="sr-only">Select</span>
                      </TableHead> */}

                        <TableHead className="text-center   font-medium text-gray-700 text-[15px] ">
                          الإجراء
                        </TableHead>

                        <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px]">
                          المدرسة
                        </TableHead>
                        <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px]">
                          الإدارة
                        </TableHead>
                        <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px]">
                          المنطقة
                        </TableHead>
                        <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px]">
                          الحساب
                        </TableHead>
                        <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px]">
                          البريد الإلكتروني
                        </TableHead>
                        <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px]">
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
                          className="border-b-[2px] border-[#e4e7ec] "
                        >
                          <TableCell className="  ">
                            <button
                              className="  h-[40px] w-[117px] rounded-md border border-solid border-gray-300 bg-transparent"
                              onClick={() => navigate("/supervisor/skills")}
                            >
                              <span className=" text-center font-bold text-[#1a7f37] text-xs [direction:rtl]">
                                {row.status}
                              </span>
                            </button>
                          </TableCell>
                          <TableCell className="py-1 px-2 text-right">
                            <span className="  font-medium text-[#027163] text-base [direction:rtl]">
                              {row.school}
                            </span>
                          </TableCell>
                          <TableCell className="py-1 px-2 text-right">
                            <span className=" font-medium text-[#027163] text-base [direction:rtl]">
                              {row.department}
                            </span>
                          </TableCell>
                          <TableCell className="py-1 px-2 text-right">
                            <span className=" font-medium text-[#027163] text-base [direction:rtl]">
                              {row.region}
                            </span>
                          </TableCell>
                          <TableCell className="py-1 px-2 text-right">
                            <span className=" font-medium text-[#027163] text-base [direction:rtl]">
                              {row.account}
                            </span>
                          </TableCell>
                          <TableCell className="py-1 px-2 text-right">
                            <span className="font-medium text-[#027163] text-base">
                              {row.email}
                            </span>
                          </TableCell>
                          <TableCell className="py-1 px-2 text-right">
                            <span className="font-medium text-[#027163] text-base">
                              {row.mobile}
                            </span>
                          </TableCell>
                          <TableCell className="py-1 px-2 text-right">
                            <span className=" font-medium text-[#027163] text-base [direction:rtl]">
                              {row.name}
                            </span>
                          </TableCell>
                          <TableCell className="py-1   text-right ">
                            <Checkbox
                              checked={row.isChecked}
                              className={
                                row.isChecked
                                  ? "w-4 h-4 bg-[#0969da] rounded-[3px]"
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
                <div className="flex justify-center items-center pt-3 pb-4 px-6     mt-4">
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
                                className="w-10 h-9 flex items-center justify-center border rounded-none border-[#cfd4dc] font-medium"
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
                              className="w-10 h-9 flex items-center justify-center border rounded-none border-[#cfd4dc]"
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
    </div>
  );
};
export default AllTrainers;
