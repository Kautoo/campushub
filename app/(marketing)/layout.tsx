import { ScrollProgress } from "@/components/marketing/scroll-progress";


/** Marketing group shell: scroll progress hairline + cookie consent. */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ScrollProgress />
      {children}
    </>
  );
}
