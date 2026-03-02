import "./globals.css";
import PrimaryNav from "@/components/PrimaryNav";
import TopLoadingBar from "@/components/TopLoadingBar";
import ToastStack from "@/components/ToastStack";

export const metadata = {
  title: "Notion CRM",
  description: "Internal CRM built on Notion"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <TopLoadingBar />
        <ToastStack />
        <header>
          <strong>Notion CRM</strong>
          <PrimaryNav />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
