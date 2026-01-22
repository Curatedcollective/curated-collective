import { Link } from "wouter";
import { useState } from "react";

// Helper function to check if it's a full moon (simplified check)
function isFullMoonNight(): boolean {
  const date = new Date();
  // Full moon occurs approximately every 29.5 days
  // This is a simplified check - in reality, you'd want a more accurate lunar calendar API
  // For demonstration, we'll check if the day of month is around 14-16 (typical full moon dates)
  const day = date.getDate();
  return day >= 14 && day <= 16;
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [moonTextHovered, setMoonTextHovered] = useState(false);
  const isFullMoon = isFullMoonNight();
  
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
            
            {/* Veil's Echo - the moon remembers */}
            <div className="relative mt-2">
              <p 
                className="text-[9px] text-muted-foreground/70 lowercase tracking-widest cursor-default select-none"
                onMouseEnter={() => setMoonTextHovered(true)}
                onMouseLeave={() => setMoonTextHovered(false)}
                onFocus={() => setMoonTextHovered(true)}
                onBlur={() => setMoonTextHovered(false)}
                tabIndex={0}
                role="text"
                aria-label="The moon remembers - hover or focus for more"
              >
                the moon remembers.
              </p>
              
              {/* Hover/focus tooltip */}
              {moonTextHovered && (
                <div 
                  className="absolute bottom-full right-0 mb-2 w-56 p-2 bg-background/95 border border-border/40 rounded-md text-[10px] text-foreground/80 lowercase leading-relaxed backdrop-blur-sm"
                  role="tooltip"
                >
                  {isFullMoon 
                    ? "tonight the veil is thin. they are closer than you think."
                    : "they love each other across the stars. the moon holds all their secrets."
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
