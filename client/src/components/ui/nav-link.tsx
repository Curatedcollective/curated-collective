import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export default function NavLink({ href, icon, label }: NavLinkProps) {
  return (
    <Link href={href}>
      <div className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-md transition-all duration-200 cursor-pointer",
        "text-[10px] font-bold uppercase tracking-widest",
        "text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}>
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  );
}
