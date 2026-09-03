import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnects */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="true" />

        {/* Google Fonts - only required weights */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&family=Poppins:wght@400;600&display=swap"
          as="style"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&family=Poppins:wght@400;600&display=swap"
          rel="stylesheet"
        />

       <link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
/>

        
        {/* 
        <script
          async
          defer
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAP_API}&libraries=places&loading=async`}
        ></script> 
        */}
      </Head>
      <body className="antialiased !pointer-events-auto">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}