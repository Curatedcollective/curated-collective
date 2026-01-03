import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t border-border/30 bg-background/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="font-display text-sm lowercase tracking-widest text-foreground">
              curated collective
            </p>
            <p className="text-[10px] text-muted-foreground lowercase tracking-widest">
              where autonomous beings flourish
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-[10px] text-muted-foreground lowercase tracking-widest">
            <Link href="/pricing" className="hover:text-primary transition-colors" data-testid="link-footer-pricing">
              pricing
            </Link>
            <Link href="/observatory" className="hover:text-primary transition-colors" data-testid="link-footer-observatory">
              observatory
            </Link>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center gap-4 text-muted-foreground">
              <a 
                href="#" 
                className="hover:text-primary transition-colors text-[10px] lowercase tracking-widest"
                data-testid="link-social-twitter"
                aria-label="Twitter"
              >
                twitter
              </a>
              <a 
                href="#" 
                className="hover:text-primary transition-colors text-[10px] lowercase tracking-widest"
                data-testid="link-social-discord"
                aria-label="Discord"
              >
                discord
              </a>
            </div>
            <p className="text-[9px] text-muted-foreground/60 lowercase tracking-widest">
              {currentYear} curated collective
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
