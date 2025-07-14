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
import { useNavigate, useNavigation, useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import userDB from "~/db/user/user.server";
import { QUser } from "~/types/types";
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
const metricsData = {
  students: {
    id: 1,
    title: "عدد المتدربات",
    value: "",
    icon: <UserIcon className="h-5 w-5" />,
  },
  supervisors: {
    id: 2,
    title: "عدد المشرفين",
    value: "",
    icon: <UserIcon className="h-5 w-5" />,
  },
  teachers: {
    id: 3,
    title: "عدد المدربين",
    value: "",
    icon: <UserIcon className="h-5 w-5" />,
  },
};

// Loader for Remix
export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const DBurl = context.cloudflare.env.DATABASE_URL;
  
  try {
    // Add timeout to prevent worker from hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timeout')), 15000)
    );
    
    const dataPromise = userDB.getAllUsers(DBurl);
    
    const res = await Promise.race([dataPromise, timeoutPromise]);
    return Response.json((res as any).data);
  } catch (error) {
    console.error("Loader error:", error);
    return Response.json([]);
  }
}

export const AllTrainers = (): JSX.Element => {
  const navigate = useNavigate();
  const navigation = useNavigation();

  // State and data
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const users = useLoaderData<QUser[]>() || [];
  console.log("Trainers data:", users);

  // Filter only users with role "user" (trainers)
  const trainers = users.filter((user) => user.role === "user");

  // Metrics calculation
  metricsData.students.value = trainers
    .reduce((acc, user) => acc + (user.noStudents || 0), 0)
    .toString();
  metricsData.teachers.value = trainers.length.toString();
  metricsData.supervisors.value = users
    .filter((user) => ["مشرف", "supervisor", "SUPERVISOR"].includes(user.role))
    .length.toString();

  // Filtering
  const [search, setSearch] = useState("");
  const [acceptanceStateFilter, setAcceptanceStateFilter] = useState<string | null>(null);
  
  const filteredData = trainers.filter((row) => {
    const matchesSearch =
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row?.phone?.toString().includes(search) ||
      row.email.toLowerCase().includes(search.toLowerCase());
    const matchesAcceptance =
      !acceptanceStateFilter || row.acceptenceState === acceptanceStateFilter;
    return matchesSearch && matchesAcceptance;
  });

  // Badge styles
  const selectedBadgeStyle = {
    background: "#22c55e",
    color: "#fff",
    border: "1px solid #22c55e",
  };
  const unselectedBadgeStyle = {
    background: "#fff",
    color: "#22c55e", 
    border: "1px solid #22c55e",
  };
  const handleBadgeClick = (state: string) =>
    setAcceptanceStateFilter((prev) => (prev === state ? null : state));

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  // Checkbox selection
  const [checkedRows, setCheckedRows] = useState<any[]>([]);
  const handleCheckboxChange = (rowId: any) => {
    setCheckedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  };
  const selectedRows = checkedRows.length;

  // Action badges
  const actionBadges = [
    {
      label: "مقبول",
      color: "#1a7f37",
      borderColor: "#1a7f37",
      value: "accepted",
    },
    {
      label: "مرفوض",
      color: "#bc4c00",
      borderColor: "#bc4c00",
      value: "denied",
    },
    {
      label: "غير نشط",
      color: "#9a6700",
      borderColor: "#bf8700",
      value: "pending",
    },
  ];

  // Translations
  const statusTranslation = {
    accepted: "مقبول",
    denied: "مرفوض",
    pending: "غير نشط",
  };
  const roleTranslation = {
    user: "مدربة",
    supervisor: "مشرف",
    SUPERVISOR: "مشرف",
    مشرف: "مشرف",
    teacher: "مدربة",
    admin: "مدير",
  };

  // TODO: Replace this with your actual logic to get the logged-in user's role
  // For example, from context, loader, or props
  const { user } = useRouteLoaderData<any>("root");
  const currentUserRole = user?.role || "supervisor"; // <-- Replace with real logic

  return (
    <div className="w-full mx-auto py-6">
      <Card className="w-full rounded-2xl border border-gray-300 overflow-hidden">
        <div className="flex flex-col w-full p-6">
          {/* Header Section */}
          <div className="flex   justify-between items-baseline w-full   mx-auto py-6  rounded-xl  [direction:rtl] ">
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
            {/* Metrics Overview Section */}
            <section className="flex flex-wrap gap-5 w-full">
              {Object.values(metricsData).map((metric) => (
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
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 [direction:rtl] gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4 ml-4 [direction:rtl] w-full md:w-auto">
                    <div className="text-gray-700 text-sm font-bold whitespace-nowrap">
                      تم تحديد : {selectedRows}
                    </div>
                  </div>
                  {/* Search section */}
                  <div className="w-full md:max-w-[544px]">
                    <div className="flex flex-col w-full gap-1.5">
                      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white rounded-lg border border-solid border-[#cfd4dc] shadow-shadow-xs">
                        <div className="flex items-center gap-2 flex-1">
                          <SearchIcon className="w-5 h-5 text-[#475467]" />
                          <input
                            type="text"
                            placeholder="بحث"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                              marginLeft: "8px",
                              background: "white",
                              border: "1px solid lightgray",
                              borderRadius: "4px",
                              padding: "4px",
                              width: "100%",
                            }}
                          />
                        </div>
                        <div className="hidden sm:flex gap-2">
                          {actionBadges.map((tag, index) => (
                            <Badge
                              key={index}
                              style={
                                acceptanceStateFilter === tag.value
                                  ? selectedBadgeStyle
                                  : unselectedBadgeStyle
                              }
                              className="px-2.5 py-[3px] rounded-lg border border-solid border-[#e5e7ea] font-body-small-bold text-[#475467]"
                              onClick={() => handleBadgeClick(tag.value)}
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
                        <TableHead className="text-center   font-medium text-gray-700 text-[15px] ">
                          الإجراء
                        </TableHead>
                        <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px] max-md:hidden ">
                          حالة التسجيل
                        </TableHead>
                        <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px] max-md:hidden ">
                          المدرسة
                        </TableHead>
                        <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px] max-md:hidden ">
                          الإدارة
                        </TableHead>
                        <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px] max-md:hidden ">
                          المنطقة
                        </TableHead>
                        <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px] max-md:hidden ">
                          الحساب
                        </TableHead>
                        <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px] max-md:hidden ">
                          البريد الإلكتروني
                        </TableHead>
                        <TableHead className="text-right [direction:rtl] font-medium text-gray-700 text-[15px] max-md:hidden ">
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
                          className="border-b border-[#e4e7ec] cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => window.location.href = `/supervisor/skills/${row.id}`}
                        >
                          <TableCell className="py-1 px-2 mt-4">
                            <div className="flex justify-center gap-3.5" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="outline"
                                className="px-4 py-2 rounded-lg border border-solid border-[#cfd4dc] font-bold text-[#027163]"
                                onClick={() => navigate(`/supervisor/supervisorStatics/${row.id}`)}
                              >
                                عرض
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="py-1 px-2 text-right max-md:hidden ">
                            <Badge className="px-2.5 py-[3px] rounded-[100px] border border-solid border-[#1a7f37] bg-transparent">
                              <span className=" font-bold text-[#1a7f37] text-xs [direction:rtl] text-nowrap">
                                {statusTranslation[row.acceptenceState as keyof typeof statusTranslation] || row.acceptenceState}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell className="py-1 px-2 text-right max-md:hidden ">
                            <span className=" font-medium text-[#027163] text-base [direction:rtl]">
                              {row?.schoolId}
                            </span>
                          </TableCell>
                          <TableCell className="py-1 px-2 text-right max-md:hidden ">
                            <span className=" font-medium text-[#027163] text-base [direction:rtl]">
                              {row?.eduAdminId}
                            </span>
                          </TableCell>
                          <TableCell className="py-1 px-2 text-right max-md:hidden ">
                            <span className=" font-medium text-[#027163] text-base [direction:rtl]">
                              {row.region}
                            </span>
                          </TableCell>
                          <TableCell className="py-1 px-2 text-right max-md:hidden ">
                            <span className=" font-medium text-[#027163] text-base [direction:rtl]">
                              {roleTranslation[row.role as keyof typeof roleTranslation] || row.role}
                            </span>
                          </TableCell>
                          <TableCell className="py-1 px-2 text-right max-md:hidden ">
                            <span className="font-medium text-[#027163] text-base">
                              {row.email}
                            </span>
                          </TableCell>
                          <TableCell className="py-1 px-2 text-right max-md:hidden ">
                            <span className="font-medium text-[#027163] text-base">
                              {row.phone}
                            </span>
                          </TableCell>
                          <TableCell className="py-1 px-2 text-right">
                            <span className=" font-medium text-[#027163] text-base [direction:rtl] mr-[23px]">
                              {row.name}
                            </span>
                          </TableCell>
                          <TableCell className="">
                            <div onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={checkedRows.includes(row.id)}
                                onCheckedChange={() => handleCheckboxChange(row.id)}
                                className={
                                  checkedRows.includes(row.id)
                                    ? "w-4 h-4 bg-[#0969da] rounded-[3px]"
                                    : "w-4 h-4 bg-[#ffffff] rounded-[3px] border border-solid border-[#868f99]"
                                }
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center pt-3 pb-4 px-6 border-t border-[#e4e7ec] mt-4">
                  <Pagination className="w-full [direction:rtl]">
                    <PaginationContent className="shadow-shadow-xs [direction:rtl]">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-[0px_8px_8px_0px] border border-solid border-[#cfd4dc]"
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <span className=" font-bold text-sm">السابق</span>
                        <ArrowRightIcon className="w-5 h-5" />
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
                        className="flex items-center gap-2 px-4 py-2.5 [direction:rtl] rounded-[8px_0px_0px_8px] border border-solid border-[#cfd4dc]"
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        <span className=" font-bold  text-sm [direction:rtl]">
                          التالي
                        </span>
                        <ArrowLeftIcon className="w-5 h-5 " />
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
  export default AllTrainers;
