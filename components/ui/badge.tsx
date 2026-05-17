import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white px-2.5 py-0.5",
        secondary:
          "bg-gray-100 text-gray-700 px-2.5 py-0.5",
        outline:
          "border border-gray-200 text-gray-600 px-2.5 py-0.5",
        gold:
          "bg-gold text-white px-2.5 py-0.5",
        hmc:
          "bg-primary text-white px-2.5 py-1",
        hfa:
          "bg-blue-600 text-white px-2.5 py-1",
        ahfa:
          "bg-purple-600 text-white px-2.5 py-1",
        selfCertified:
          "bg-amber-500 text-white px-2.5 py-1",
        awaiting:
          "bg-gray-400 text-white px-2.5 py-1",
        featured:
          "bg-gold text-white px-2.5 py-1 font-semibold",
        open:
          "bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5",
        closed:
          "bg-red-50 text-red-600 border border-red-200 px-2.5 py-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
