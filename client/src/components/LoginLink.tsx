import React from "react";

export default function LoginLink({ redirect = "/god" }: { redirect?: string }) {
  const href = `/api/login?redirect=${encodeURIComponent(redirect)}`;
  return (
    <a href={href} className="login-link" style={{ color: "inherit", textDecoration: "none" }}>
      Log in
    </a>
  );
}
