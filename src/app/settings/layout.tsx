export default function SettingsLayout({
  children,
}: LayoutProps<"/settings">) {
  return (
    <div className="flex flex-1 flex-col pt-[env(safe-area-inset-top)]">
      {children}
    </div>
  );
}
