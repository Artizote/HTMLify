import { Hero } from "@/components/home/hero";
import { Quote } from "@/components/home/quote";
import { Features } from "@/components/home/features";
import { Footer } from "@/components/home/footer";

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
