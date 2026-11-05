"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cva, VariantProps } from "class-variance-authority";
import { IconArrowLeft, IconLoader } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const BackButton = ({ href }: { href?: string }) => {
  const router = useRouter();

  return (
    <Button
      size={"icon-sm"}
      variant={"ghost"}
      className="rounded-full"
      onClick={() => {
        if (href) {
          router.push(href);
        } else {
          router.back();
        }
      }}
    >
      <IconArrowLeft /> <span className="sr-only">Back to previous page</span>
    </Button>
  );
};

const ActionButton = ({
  children,
  isPending = false,
  ...props
}: ButtonProps & { isPending?: boolean }) => {
  return (
    <Button {...props} disabled={isPending || props.disabled}>
      {isPending ? <IconLoader className="animate-spin" /> : children}
    </Button>
  );
};

const FormButton = ({
  children,
  isPending,
  className,
  ...props
}: ButtonProps & { isPending?: boolean }) => {
  return (
    <Button
      className={cn("font-semibold", className)}
      {...props}
      disabled={isPending || props.disabled}
    >
      {isPending ? <IconLoader className="animate-spin" /> : children}
    </Button>
  );
};

const tableButtonVariants = cva("rounded-full", {
  variants: {
    variant: {
      default: "",
      edit: "text-primary",
      delete: "text-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const TableActionButton = ({
  tooltip,
  variant = "default",
  className,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof tableButtonVariants> & { tooltip: string }) => {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            className={cn(tableButtonVariants({ variant, className }))}
            size={"icon"}
            variant={"outline"}
            {...props}
          />
        }
      ></TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export { BackButton, ActionButton, FormButton, TableActionButton };
