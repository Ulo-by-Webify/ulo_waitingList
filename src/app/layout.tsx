import type { Metadata } from "next";
import Script from "next/script";
import "@/index.css";
import Providers from "@/app/providers";

export const metadata: Metadata = {
  title:
    "Beyond the Tour: Authentic African Travel & Soulful Stays in Lagos Nigeria | Ulô",
  description: "Lovable Generated Project",
  authors: [{ name: "Lovable" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title:
      "Beyond the Tour: Authentic African Travel & Soulful Stays in Lagos Nigeria | Ulô",
    description: "Lovable Generated Project",
    type: "website",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@lovable_dev",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Script id="mailerlite-universal" strategy="afterInteractive">
          {`
            (function(w,d,e,u,f,l,n){w[f]=w[f]||function(){(w[f].q=w[f].q||[])
            .push(arguments);},l=d.createElement(e),l.async=1,l.src=u,
            n=d.getElementsByTagName(e)[0],n.parentNode.insertBefore(l,n);})
            (window,document,'script','https://assets.mailerlite.com/js/universal.js','ml');
            ml('account', '1718389');
          `}
        </Script>
      </body>
    </html>
  );
}
