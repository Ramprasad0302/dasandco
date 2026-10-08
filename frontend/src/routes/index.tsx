import { createFileRoute } from "@tanstack/react-router";
import { brand } from "@/content/site";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Cursor } from "@/components/site/Cursor";
import { Loader } from "@/components/site/Loader";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Services } from "@/components/site/Services";
import { WhyUs } from "@/components/site/WhyUs";
import { Portfolio } from "@/components/site/Portfolio";
import { Process, Technology } from "@/components/site/Process";
import { Testimonials, Faq } from "@/components/site/Testimonials";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

const title = "DAS & CO | Luxury Jewelry CAD Design Studio";
const description =
  "Premium jewelry CAD design studio creating precision digital designs with craftsmanship, innovation, and luxury.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "DAS & CO",
          description,
          email: brand.email,
          areaServed: "Worldwide",
          serviceType: "Jewelry CAD Design",
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SmoothScroll>
      <Loader />
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <About />
        <Services />
        <WhyUs />
        <Portfolio />
        <Process />
        <Technology />
        <Testimonials />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
