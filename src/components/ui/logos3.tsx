"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface Logo {
  id: string;
  description: string;
  image: string;
  className?: string;
}

interface Logos3Props {
  heading?: string;
  logos?: Logo[];
  className?: string;
}

const Logos3 = ({
  heading = "We breathe the same air as Google, Meta, Amazon, Apple & Netflix",
  logos = [
    { id: "logo-1", description: "Google", image: "https://cdn.simpleicons.org/google", className: "h-7 w-auto" },
    { id: "logo-2", description: "Meta", image: "https://cdn.simpleicons.org/meta", className: "h-7 w-auto" },
    { id: "logo-3", description: "Amazon", image: "https://cdn.simpleicons.org/amazon", className: "h-7 w-auto" },
    { id: "logo-4", description: "Apple", image: "https://cdn.simpleicons.org/apple", className: "h-7 w-auto" },
    { id: "logo-5", description: "Netflix", image: "https://cdn.simpleicons.org/netflix", className: "h-7 w-auto" },
  ],
}: Logos3Props) => {
  return (
    <section className="py-64">
      <div className="container flex flex-col items-center text-center">
        <h1 className="my-6 text-2xl font-bold text-pretty lg:text-4xl">
          {heading}
        </h1>
      </div>
      <div className="pt-10 md:pt-16 lg:pt-20">
        <div className="relative mx-auto flex items-center justify-center lg:max-w-5xl">
          <Carousel
            opts={{ loop: true }}
            plugins={[
              AutoScroll({
                playOnInit: true,
                speed: 0.9,
                stopOnInteraction: false,
                stopOnMouseEnter: false,
                stopOnFocusIn: false,
              }),
            ]}
          >
            <CarouselContent className="ml-0">
              {logos.map((logo) => (
                <CarouselItem
                  key={logo.id}
                  className="flex basis-1/3 justify-center pl-0 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                >
                  <div className="mx-10 flex shrink-0 items-center justify-center">
                    <img src={logo.image} alt={logo.description} className={logo.className} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="absolute inset-y-0 left-0 w-12 bg-linear-to-r from-background to-transparent"></div>
          <div className="absolute inset-y-0 right-0 w-12 bg-linear-to-l from-background to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

export { Logos3 };
