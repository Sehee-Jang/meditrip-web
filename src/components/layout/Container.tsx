interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={`w-full max-w-7xl px-4 md:px-6 mx-auto ${className || ""}`}>
      {children}
    </div>
  );
}

// import { cn } from "@/lib/utils";

// export default function Container({
//   children,
//   className,
// }: {
//   children: React.ReactNode;
//   className?: string;
// }) {
//   return (
//     <div className={cn("w-full max-w-7xl mx-auto px-4 md:px-6", className)}>
//       {children}
//     </div>
//   );
// }
