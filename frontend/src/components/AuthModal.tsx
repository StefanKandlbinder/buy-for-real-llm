"use client";

import { usePathname, useRouter } from "next/navigation";
import { SignIn, SignUp } from "@clerk/nextjs";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AuthModal() {
  const router = useRouter();
  const pathname = usePathname();

  // Derive the open state from the URL
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";
  const isSignInPage = pathname === "/sign-in";

  // Handler for closing the dialog
  const handleClose = () => {
    router.push("/");
  };

  return (
    <Dialog open={isAuthPage} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="p-0">
        <DialogHeader className="px-10 pt-10">
          <DialogTitle>
            {isSignInPage
              ? "Sign in to buy-for-real"
              : "Sign Up in to buy-for-real"}
          </DialogTitle>
          <DialogDescription>
            {isSignInPage
              ? "Welcome back! Please sign in to continue"
              : "Welcome! Please sign up to continue"}
          </DialogDescription>
        </DialogHeader>
        {pathname === "/sign-in" ? (
          <SignIn signUpUrl="/sign-up" />
        ) : (
          <SignUp signInUrl="/sign-in" />
        )}
        {pathname === "/sign-up/verify-email-address" ? (
          <SignIn signUpUrl="/sign-up/verify-email-address" oauthFlow="popup" />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
