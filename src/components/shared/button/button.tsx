"use client";

import { ArrowLeft, Loader } from "lucide-react";
import { useRouter } from "next-nprogress-bar";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cva, VariantProps } from "class-variance-authority";

const BackButton = ({ href }: { href?: string }) => {
  const router = useRouter();

  return (
    <Button
      size={"icon"}
      variant={"outline"}
      className="rounded-full text-primary"
      onClick={() => {
        if (href) {
          router.replace(href);
        } else {
          router.back();
        }
      }}
    >
      <ArrowLeft /> <span className="sr-only">Back to previous page</span>
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
      {isPending ? <Loader className="animate-spin" /> : children}
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
      {isPending && <Loader className="animate-spin" />}
      {children}
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
      <TooltipTrigger asChild>
        <Button
          className={cn(tableButtonVariants({ variant, className }))}
          size={"icon"}
          variant={"outline"}
          {...props}
        />
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export { BackButton, ActionButton, FormButton, TableActionButton };
