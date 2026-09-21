import { Features } from "@/components/blocks/features-8";
import { Footer } from "@/components/home/footer";
import { Hero } from "@/components/home/hero";
import { Quote } from "@/components/quote";

export default function Home() {
  return (
    <main className="flex-1  h-full mb-20">
      <Hero />
      <Quote />
      <Features />
      <Footer />
    </main>
  );
}
