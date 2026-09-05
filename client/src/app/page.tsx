import Navbar from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Footer } from "@/components/sections/Footer";
import { Features } from "@/components/sections/Features";
import { Solutions } from "@/components/sections/Solutions";
import { Pricing } from "@/components/sections/Pricing";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Solutions />
      <Pricing />
      <Footer />
    </>
  );
}
