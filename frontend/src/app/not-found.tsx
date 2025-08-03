import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HomeIcon, ArrowLeftIcon, SearchIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <SearchIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Page Not Found</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. It
              might have been moved, deleted, or you entered the wrong URL.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/">
                  <HomeIcon className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/admin/products">
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Browse Products
                </Link>
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>You can also try:</p>
              <ul className="mt-2 space-y-1 text-left">
                <li>
                  •{" "}
                  <Link
                    href="/admin/products"
                    className="underline hover:text-foreground"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  •{" "}
                  <Link
                    href="/admin/ads"
                    className="underline hover:text-foreground"
                  >
                    Advertisements
                  </Link>
                </li>
                <li>
                  •{" "}
                  <Link
                    href="/sign-in"
                    className="underline hover:text-foreground"
                  >
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
