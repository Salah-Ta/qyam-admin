import React, { useState } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { type ClassValue, clsx } from "clsx";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  MoreHorizontalIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import userDB from "~/db/user/user.server";
import {
  useLoaderData,
  useRouteLoaderData,
  useFetcher,
} from "@remix-run/react";
import { QUser } from "~/types/types";
import { Link } from "@remix-run/react";

// Utility function
const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// Badge component
const badgeVariants = cva(
  "inline-flex items-center cursor-pointer rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow ",
        secondary: "border-transparent bg-secondary text-secondary-foreground ",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow ",
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
const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <div className={cn(badgeVariants({ variant }), className)} {...props} />
);

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
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      {" "}
      <CheckIcon className="h-4 w-4" />{" "}
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
      buttonVariants({ variant: isActive ? "outline" : "ghost", size }),
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
    className={cn("h-10 px-2  font-medium ", className)}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("p-2 align-middle ", className)} {...props} />
));
TableCell.displayName = "TableCell";

// Confirmation Modal Component
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: "danger" | "warning" | "info";
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type,
}: ConfirmationModalProps): React.ReactElement | null => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          buttonClass: "bg-red-600 hover:bg-red-700 text-white",
          iconColor: "text-red-600",
        };
      case "warning":
        return {
          buttonClass: "bg-orange-600 hover:bg-orange-700 text-white",
          iconColor: "text-orange-600",
        };
      default:
        return {
          buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
          iconColor: "text-blue-600",
        };
    }
  };

  const { buttonClass, iconColor } = getTypeStyles();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${iconColor}`}
          >
            {type === "danger" && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {type === "warning" && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {type === "info" && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 [direction:rtl]">
            {title}
          </h3>
        </div>
        <p className="text-gray-600 mb-6 [direction:rtl]">{message}</p>
        <div className="flex gap-3 justify-end [direction:rtl]">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </Button>
          <Button onClick={onConfirm} className={`px-4 py-2 ${buttonClass}`}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Metrics data
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
      setTimeout(() => reject(new Error("Database operation timeout")), 15000)
    );

    const dataPromise = userDB.getAllUsers(DBurl);

    const res = await Promise.race([dataPromise, timeoutPromise]);
    return Response.json((res as any).data);
  } catch (error) {
    console.error("Loader error:", error);
    return Response.json([]);
  }
}

export async function action({ request, context }: any) {
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const userId = formData.get("id");

  const userDB = (await import("~/db/user/user.server")).default;
  const DBurl = context.cloudflare.env.DATABASE_URL;

  try {
    if (actionType === "delete") {
      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, message: "معرف المستخدم مطلوب" }),
          { status: 400 }
        );
      }
      await userDB.deleteUser(userId, DBurl);
      return new Response(
        JSON.stringify({ success: true, message: "تم حذف المستخدم بنجاح" }),
        { status: 200 }
      );
    } else if (actionType === "updateStatus") {
      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, message: "معرف المستخدم مطلوب" }),
          { status: 400 }
        );
      }
      const status = formData.get("status");
      const email = formData.get("email");
      
      // Email configuration for sending deactivation emails
      const emailConfig = {
        resendApi: context.cloudflare.env.RESEND_API || "",
        mainEmail: context.cloudflare.env.MAIN_EMAIL || "",
        userEmail: email || ""
      };
      
      await userDB.editUserRegisteration(userId, status, DBurl, emailConfig);
      return new Response(
        JSON.stringify({
          success: true,
          message: "تم تحديث حالة المستخدم بنجاح",
        }),
        { status: 200 }
      );
    } else if (actionType === "bulkUpdateStatus") {
      const userIdsString = formData.get("userIds");
      const status = formData.get("status");

      if (!userIdsString || !status) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "معرفات المستخدمين والحالة مطلوبة",
          }),
          { status: 400 }
        );
      }

      const userIds = JSON.parse(userIdsString as string);

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "يجب تحديد مستخدم واحد على الأقل",
          }),
          { status: 400 }
        );
      }

      await userDB.bulkEditUserRegisteration(
        userIds,
        status as "accepted" | "denied",
        DBurl
      );

      const statusMessage = status === "accepted" ? "قبول" : "رفض";
      return new Response(
        JSON.stringify({
          success: true,
          message: `تم ${statusMessage} ${userIds.length} مستخدم بنجاح`,
        }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "نوع العملية غير صالح" }),
      { status: 400 }
    );
  } catch (error) {
    console.error("Action error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "حدث خطأ أثناء العملية" }),
      { status: 500 }
    );
  }
}

export const Users = (): React.JSX.Element => {
  // State and data
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const rawUsers = useLoaderData<QUser[]>();
  const users = Array.isArray(rawUsers) ? rawUsers : [];
  console.log("Users data:", users);

  // Metrics calculation
  metricsData.students.value = users
    .reduce((acc, user) => acc + (user?.noStudents || 0), 0)
    .toString();
  metricsData.teachers.value = users
    .filter((user) => user?.role === "user")
    .length.toString();
  metricsData.supervisors.value = users
    .filter((user) =>
      ["مشرف", "supervisor", "SUPERVISOR"].includes(user?.role || "")
    )
    .length.toString();

  // Filtering
  const [search, setSearch] = useState("");
  const [acceptanceStateFilter, setAcceptanceStateFilter] = useState<
    string | null
  >(null);

  const filteredUsers = users;
  const filteredData = filteredUsers.filter((row) => {
    const matchesSearch =
      row?.name?.toLowerCase().includes(search.toLowerCase()) ||
      row?.phone?.toString().includes(search) ||
      row?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesAcceptance =
      !acceptanceStateFilter || row?.acceptenceState === acceptanceStateFilter;
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

  // Confirmation modal state
  type ConfirmationModalState = {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    type: "danger" | "warning" | "info";
    onConfirm: () => void;
  };

  const [confirmationModal, setConfirmationModal] =
    useState<ConfirmationModalState>({
      isOpen: false,
      title: "",
      message: "",
      confirmText: "",
      cancelText: "إلغاء",
      type: "info",
      onConfirm: () => {},
    });

  const showConfirmation = (config: Partial<ConfirmationModalState>) => {
    setConfirmationModal((prev) => ({
      ...prev,
      ...config,
      isOpen: true,
      onConfirm: config.onConfirm || (() => {}),
    }));
  };

  const hideConfirmation = () => {
    setConfirmationModal({
      ...confirmationModal,
      isOpen: false,
    });
  };

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
    pending: "قيد المراجعة",
    idle: "غير نشط",
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
  const rootData = useRouteLoaderData<any>("root");
  const currentUserRole = rootData?.user?.role || "supervisor"; // <-- Replace with real logic

  // Action handlers for admin actions (accept, deny, disable/reactivate, delete)
  const fetcher = useFetcher();

  const handleAdminAction = (
    action: "accepted" | "denied" | "idle",
    user: any,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const actionTexts = {
      accepted: {
        title: "تأكيد قبول المستخدم",
        message: `هل أنت متأكد من قبول المستخدم "${user.name}"؟`,
        confirm: "قبول",
        type: "info" as const,
      },
      denied: {
        title: "تأكيد رفض المستخدم",
        message: `هل أنت متأكد من رفض المستخدم "${user.name}"؟`,
        confirm: "رفض",
        type: "warning" as const,
      },
      idle: {
        title: "تأكيد تعطيل المستخدم",
        message: `هل أنت متأكد من تعطيل المستخدم "${user.name}"؟`,
        confirm: "تعطيل",
        type: "warning" as const,
      },
    };

    const actionText = actionTexts[action];

    showConfirmation({
      title: actionText.title,
      message: actionText.message,
      confirmText: actionText.confirm,
      type: actionText.type,
      onConfirm: () => {
        fetcher.submit(
          {
            actionType: "updateStatus",
            status: action,
            id: user.id,
            email: user.email,
          },
          { method: "POST" }
        );
      },
    });
  };

  const handleDeleteUser = (user: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    showConfirmation({
      title: "تأكيد حذف المستخدم",
      message: `هل أنت متأكد من حذف المستخدم "${user.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`,
      confirmText: "حذف",
      type: "danger",
      onConfirm: () => {
        fetcher.submit(
          {
            actionType: "delete",
            id: user.id,
          },
          { method: "POST" }
        );
      },
    });
  };

  const handleReactivateUser = (user: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    showConfirmation({
      title: "تأكيد إعادة تنشيط المستخدم",
      message: `هل أنت متأكد من إعادة تنشيط المستخدم "${user.name}"؟`,
      confirmText: "إعادة تنشيط",
      type: "info",
      onConfirm: () => {
        fetcher.submit(
          {
            actionType: "updateStatus",
            status: "accepted",
            id: user.id,
            email: user.email,
          },
          { method: "POST" }
        );
      },
    });
  };

  // Bulk operations handlers
  const handleBulkAccept = () => {
    if (checkedRows.length === 0) return;

    showConfirmation({
      title: "تأكيد قبول المستخدمين المحددين",
      message: `هل أنت متأكد من قبول ${checkedRows.length} مستخدم محدد؟`,
      confirmText: "قبول الجميع",
      type: "info",
      onConfirm: () => {
        fetcher.submit(
          {
            actionType: "bulkUpdateStatus",
            status: "accepted",
            userIds: JSON.stringify(checkedRows),
          },
          { method: "POST" }
        );
        setCheckedRows([]); // Clear selections after submission
      },
    });
  };

  const handleBulkDeny = () => {
    if (checkedRows.length === 0) return;

    showConfirmation({
      title: "تأكيد رفض المستخدمين المحددين",
      message: `هل أنت متأكد من رفض ${checkedRows.length} مستخدم محدد؟`,
      confirmText: "رفض الجميع",
      type: "warning",
      onConfirm: () => {
        fetcher.submit(
          {
            actionType: "bulkUpdateStatus",
            status: "denied",
            userIds: JSON.stringify(checkedRows),
          },
          { method: "POST" }
        );
        setCheckedRows([]); // Clear selections after submission
      },
    });
  };

  return (
    <div className="w-full mx-auto py-6">
      {/* Confirmation Modal */}
      {confirmationModal.isOpen ? (
        <div
          key="confirmation-modal"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={hideConfirmation}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  confirmationModal.type === "danger"
                    ? "text-red-600"
                    : confirmationModal.type === "warning"
                    ? "text-orange-600"
                    : "text-blue-600"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 [direction:rtl]">
                {confirmationModal.title}
              </h3>
            </div>
            <p className="text-gray-600 mb-6 [direction:rtl]">
              {confirmationModal.message}
            </p>
            <div className="flex gap-3 justify-end [direction:rtl]">
              <Button
                variant="outline"
                onClick={hideConfirmation}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {confirmationModal.cancelText}
              </Button>
              <Button
                onClick={() => {
                  confirmationModal.onConfirm();
                  hideConfirmation();
                }}
                className={`px-4 py-2 ${
                  confirmationModal.type === "danger"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : confirmationModal.type === "warning"
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {confirmationModal.confirmText}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Success/Error Messages */}
      {fetcher.data &&
        typeof fetcher.data === "object" &&
        "success" in fetcher.data && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              (fetcher.data as any).success
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {(fetcher.data as any).message ||
              ((fetcher.data as any).success ? "تمت العملية بنجاح" : "حدث خطأ")}
          </div>
        )}

      <Card className="w-full rounded-2xl border border-gray-300 overflow-hidden">
        <div className="flex flex-col w-full p-6">
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
                    <h3 className="self-stretch font-medium text-[#535861] text-sm tracking-[0] leading-5 w-full">
                      {metric.title}
                    </h3>
                    <p className="font-bold text-[#181d27] text-3xl tracking-[0] leading-[38px]">
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
                  {currentUserRole === "admin" && selectedRows > 0 && (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleBulkAccept}
                        className="px-4 py-2 text-[#12B76A] hover:bg-gray-100 bg-white  rounded-lg text-sm"
                      >
                        قبول
                        <svg
                          width="21"
                          height="20"
                          viewBox="0 0 21 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M19.7002 10C19.7002 5.02943 15.6707 1 10.7002 1C5.72963 1 1.7002 5.02943 1.7002 10C1.7002 14.9705 5.72963 19 10.7002 19C15.6707 19 19.7002 14.9705 19.7002 10Z"
                            stroke="#12B76A"
                            stroke-width="1.5"
                          />
                          <path
                            d="M6.7002 10.5L9.2002 13L14.7002 7"
                            stroke="#12B76A"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </Button>
                      <Button
                        onClick={handleBulkDeny}
                        className="px-4 py-2 text-[#D1242F] hover:bg-gray-100 bg-white  rounded-lg text-sm"
                      >
                        رفض
                        <svg
                          width="21"
                          height="20"
                          viewBox="0 0 21 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M19.4692 10C19.4692 5.02943 15.4398 1 10.4692 1C5.49867 1 1.46924 5.02943 1.46924 10C1.46924 14.9705 5.49867 19 10.4692 19C15.4398 19 19.4692 14.9705 19.4692 10Z"
                            stroke="#D1242F"
                            stroke-width="1.5"
                          />
                          <path
                            d="M13.4686 13L7.46924 7M7.46988 13L13.4692 7"
                            stroke="#D1242F"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </Button>
                    </div>
                  )}
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
                        className={`border-b border-[#e4e7ec] ${
                          currentUserRole === "admin"
                            ? "cursor-pointer hover:bg-gray-50 transition-colors"
                            : ""
                        }`}
                        onClick={
                          currentUserRole === "admin"
                            ? () =>
                                (window.location.href = `/supervisor/supervisorStatics/${row?.id}`)
                            : undefined
                        }
                      >
                        <TableCell className="py-1 px-2 mt-4">
                          <div
                            className="flex justify-center gap-3.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {currentUserRole === "admin" ? (
                              row.acceptenceState !== "idle" ? (
                                <>
                                  <button
                                    onClick={(e) =>
                                      handleAdminAction("accepted", row, e)
                                    }
                                    disabled={
                                      row.acceptenceState === "accepted"
                                    }
                                    className="button p-2 text-[#1A7F37] border border-[#1A7F37] rounded-lg disabled:border-gray-300  disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-[#1A7F37]/10 transition-all"
                                  >
                                    قبول
                                  </button>
                                  <button
                                    onClick={(e) =>
                                      handleAdminAction("denied", row, e)
                                    }
                                    disabled={row.acceptenceState === "denied"}
                                    className="button p-2 rounded-lg text-[#D1242F] border border-[#D1242F] disabled:border-gray-300  disabled:text-gray-300 disabled:cursor-not-allowed hover:opacity-80 hover:bg-[#D1242F]/10 transition-all"
                                  >
                                    رفض
                                  </button>
                                  <button
                                    onClick={(e) =>
                                      handleAdminAction("idle", row, e)
                                    }
                                    disabled={row.acceptenceState === "idle"}
                                    className="button  p-2 rounded-lg text-[#e16f4cf7] border border-[#e16f4cf7] disabled:border-gray-300  disabled:text-gray-300 disabled:cursor-not-allowed hover:opacity-80 hover:bg-[#e16f4cf7]/10 transition-all"
                                  >
                                    تعطيل
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteUser(row, e)}
                                    className="button p-2 rounded-lg text-red-600 border border-red-600 flex gap-1 hover:opacity-80 hover:bg-red-600/10 transition-all"
                                  >
                                    حذف
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="20"
                                      height="21"
                                      viewBox="0 0 20 21"
                                      fill="none"
                                    >
                                      <path
                                        d="M2.5 5.5H4.16667M4.16667 5.5H17.5M4.16667 5.5V17.1667C4.16667 17.6087 4.34226 18.0326 4.65482 18.3452C4.96738 18.6577 5.39131 18.8333 5.83333 18.8333H14.1667C14.6087 18.8333 15.0326 18.6577 15.3452 18.3452C15.6577 18.0326 15.8333 17.6087 15.8333 17.1667V5.5H4.16667ZM6.66667 5.5V3.83333C6.66667 3.3913 6.84226 2.96738 7.15482 2.65482C7.46738 2.34226 7.89131 2.16666 8.33333 2.16666H11.6667C12.1087 2.16666 12.5326 2.34226 12.8452 2.65482C13.1577 2.96738 13.3333 3.3913 13.3333 3.83333V5.5M8.33333 9.66666V14.6667M11.6667 9.66666V14.6667"
                                        stroke="#B42318"
                                        strokeWidth="1.3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={(e) => handleReactivateUser(row, e)}
                                  className="button p-2 rounded-lg text-[#e16f4cf7] border border-[#e16f4cf7] disabled:border-gray-300  disabled:text-gray-300 disabled:cursor-not-allowed hover:opacity-80 hover:bg-[#e16f4cf7]/10 transition-all"
                                >
                                  إعادة تنشيط
                                </button>
                              )
                            ) : (
                              <Button
                                asChild
                                variant="outline"
                                className="px-4 py-2 rounded-lg border border-solid border-[#cfd4dc] font-bold text-[#027163]"
                              >
                                <Link
                                  to={`/supervisor/supervisorStatics/${row.id}`}
                                >
                                  عرض
                                </Link>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-right max-md:hidden ">
                          <Badge className="px-2.5 py-[3px] rounded-[100px] border border-solid border-[#1a7f37] bg-transparent">
                            <span className="font-bold text-[#1a7f37] text-xs [direction:rtl]">
                              {statusTranslation[
                                row?.acceptenceState as keyof typeof statusTranslation
                              ] ??
                                row?.acceptenceState ??
                                "غير محدد"}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-right max-md:hidden ">
                          <span className=" font-medium text-[#027163] text-base [direction:rtl]">
                            {row?.schoolName || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-right max-md:hidden ">
                          <span className=" font-medium text-[#027163] text-base [direction:rtl]">
                            {row?.eduAdminName || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-right max-md:hidden ">
                          <span className=" font-medium text-[#027163] text-base [direction:rtl]">
                            {row?.regionName || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-right max-md:hidden ">
                          <span className=" font-medium text-[#027163] text-base [direction:rtl]">
                            {roleTranslation[
                              row?.role as keyof typeof roleTranslation
                            ] ??
                              row?.role ??
                              "-"}
                          </span>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-right max-md:hidden ">
                          <span className="font-medium text-[#027163] text-base">
                            {row?.email || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-right max-md:hidden ">
                          <span className="font-medium text-[#027163] text-base">
                            {row?.phone || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-right">
                          <span className=" font-medium text-[#027163] text-base [direction:rtl] mr-[23px]">
                            {row?.name || "غير محدد"}
                          </span>
                        </TableCell>
                        <TableCell className="">
                          <div onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={checkedRows.includes(row?.id)}
                              onCheckedChange={() =>
                                handleCheckboxChange(row?.id)
                              }
                              className={
                                row.isChecked
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
export default Users;
