import { Image, Video } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User2 } from "lucide-react";
import { ChevronUp } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

// Menu items.
const products = [
  {
    title: "Images",
    url: "/products",
    icon: Image,
  },
];

const ads = [
  {
    title: "video",
    url: "/ads",
    icon: Video,
  },
];
export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Products</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {products.map((product) => (
                <SidebarMenuItem key={product.title}>
                  <SidebarMenuButton asChild>
                    <Link href={product.url} scroll={false}>
                      <product.icon />
                      <span>{product.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Advertisements</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ads.map((product) => (
                <SidebarMenuItem key={product.title}>
                  <SidebarMenuButton asChild>
                    <Link href={product.url} scroll={false}>
                      <product.icon />
                      <span>{product.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SignedIn>
          <UserButton />
        </SignedIn>

        <SignedOut>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 />
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <Link className="w-full h-full" href="/sign-in">
                      Sign In
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link className="w-full h-full" href="/sign-up">
                      Sign Up
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SignedOut>
      </SidebarFooter>
    </Sidebar>
  );
}
