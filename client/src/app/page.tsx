import Navbar from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Footer } from "@/components/sections/Footer";
import { Features } from "@/components/sections/Features";
import { Solutions } from "@/components/sections/Solutions";
import { Pricing } from "@/components/sections/Pricing";
import { getSessionUser } from "@/lib/session";

export default async function Home() {
  const user = await getSessionUser();

  return (
    <>
      <Navbar user={user} />
      <Hero isAuthenticated={Boolean(user)} />
      <Features />
      <Solutions />
      <Pricing />
      <Footer />
    </>
  );
}
