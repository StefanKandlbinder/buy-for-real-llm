import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { api } from "@/trpc/server/server";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const groups = await api.groups.getNestedGroups();
  
  return (
    <SidebarProvider>
      <AppSidebar initialGroups={groups} />
      <SidebarTrigger />
      {children}
    </SidebarProvider>
  );
}
