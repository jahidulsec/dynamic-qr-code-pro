"use client";

import { useState } from "react";
import { IconDevices, IconShieldLock, IconUserCircle } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChangePasswordForm } from "@/features/profile/components/change-password-form";
import { PanelHeader } from "@/features/profile/components/profile-panel";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { SessionPanel } from "@/features/profile/components/session-panel";
import { initialsOf, type ProfileUser } from "@/features/profile/libs/profile-user";

export type ProfileTab = "account" | "security" | "devices";

const TABS: { value: ProfileTab; label: string; icon: React.ReactNode; title: string; description: string }[] = [
  {
    value: "account",
    label: "Account",
    icon: <IconUserCircle />,
    title: "Account",
    description: "Your name and the email you sign in with.",
  },
  {
    value: "security",
    label: "Security",
    icon: <IconShieldLock />,
    title: "Password & security",
    description: "Change your password and protect your account.",
  },
  {
    value: "devices",
    label: "Devices",
    icon: <IconDevices />,
    title: "Signed-in devices",
    description: "Sign out any device you don't recognize.",
  },
];

type ProfileDialogProps = {
  user: ProfileUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: ProfileTab;
};

export function ProfileDialog({ user, open, onOpenChange, defaultTab = "account" }: ProfileDialogProps) {
  const [tab, setTab] = useState<ProfileTab>(defaultTab);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        // reopening starts on the default tab again
        if (!next) setTab(defaultTab);
      }}
    >
      <DialogContent className="flex h-[min(42rem,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogTitle className="sr-only">Profile settings</DialogTitle>
        <DialogDescription className="sr-only">Manage your account, password and signed-in devices.</DialogDescription>

        <Tabs
          orientation="vertical"
          value={tab}
          onValueChange={(value) => setTab(value as ProfileTab)}
          className="min-h-0 flex-1 flex-col gap-0 md:flex-row"
        >
          <aside className="flex shrink-0 flex-col gap-4 border-b bg-muted/40 p-3 md:w-60 md:border-r md:border-b-0 md:p-4">
            <div className="flex items-center gap-3 px-1 pr-10 md:pr-1">
              <Avatar size="lg">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">{initialsOf(user.name)}</AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="hidden px-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase md:block">
                Settings
              </span>
              <TabsList className="h-auto! w-full flex-row! gap-1 bg-transparent p-0 md:flex-col!">
                {TABS.map((item) => (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className="h-9 flex-1 justify-center gap-2 px-2.5 text-muted-foreground hover:bg-background/60 data-active:bg-background data-active:text-foreground data-active:shadow-xs data-active:ring-1 data-active:ring-foreground/10 md:w-full md:flex-none md:justify-start dark:data-active:bg-background/10 [&_svg]:size-4.5"
                  >
                    {item.icon}
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </aside>

          {TABS.map((item) => (
            <TabsContent key={item.value} value={item.value} className="flex min-h-0 min-w-0 flex-col">
              <PanelHeader title={item.title} description={item.description} />
              {item.value === "account" && <ProfileForm user={user} />}
              {item.value === "security" && <ChangePasswordForm />}
              {item.value === "devices" && <SessionPanel />}
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
