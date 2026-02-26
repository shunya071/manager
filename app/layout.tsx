import "./globals.css";
import PrimaryNav from "@/components/PrimaryNav";

export const metadata = {
  title: "Notion CRM",
  description: "Internal CRM built on Notion"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header>
          <strong>Notion CRM</strong>
          <PrimaryNav />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
