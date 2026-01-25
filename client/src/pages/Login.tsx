import React from "react";
import LoginLink from "../components/LoginLink";

export default function LoginPage() {
  return (
    <div className="p-8 max-w-lg mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      <p className="mb-6">Use your provider to sign in and continue to the admin page.</p>
      <div style={{ display: "inline-block" }}>
        <LoginLink redirect="/god" />
      </div>
    </div>
  );
}
