import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AdminBreadcrumb } from "@/components/Group/AdminBreadcrumb";
import { UserMenu } from "@/components/UserMenu";
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
      <div className="flex flex-col min-h-screen w-full">
        <header className="flex items-center justify-between py-4 px-6 border-b w-full gap-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <AdminBreadcrumb initialGroups={groups} />
          </div>
          <UserMenu className="flex" />
        </header>
        <main className="flex-1 w-full px-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}
