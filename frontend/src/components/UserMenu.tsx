"use client";

import { User2, ChevronUp } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function UserMenu({ className }: { className?: string }) {
  return (
    <div className={className}>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <User2 className="h-4 w-4" />
              <ChevronUp className="ml-auto h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link className="w-full h-full" href="/sign-in">
                Sign In
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link className="w-full h-full" href="/sign-up">
                Sign Up
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SignedOut>
    </div>
  );
}
