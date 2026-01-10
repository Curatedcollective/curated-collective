## Packages
framer-motion | For smooth page transitions and micro-interactions
date-fns | For formatting dates nicely
react-syntax-highlighter | For code editing and display
lucide-react | For beautiful icons (already in base, but ensuring availability)

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
  mono: ["var(--font-mono)"],
}

API expects credentials: "include" for all requests (handled by existing queryClient, but hooks must also follow).
