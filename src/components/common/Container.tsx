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
