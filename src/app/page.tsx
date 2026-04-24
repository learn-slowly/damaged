import Hero from "@/components/Hero";
import Story from "@/components/Story";
import Projects from "@/components/Projects";
import Together from "@/components/Together";
import Photos from "@/components/Photos";
import Closing from "@/components/Closing";

export default function Home() {
  return (
    <main>
      <Hero />
      <Story />
      <Projects />
      <Together />
      <Photos />
      <Closing />
    </main>
  );
}
