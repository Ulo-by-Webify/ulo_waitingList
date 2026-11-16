import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import type { HomeContent } from "@/lib/home-content";

type HomesWithSoulSectionProps = {
  /** Heading, photos and caption, edited on the admin Home page. */
  homes: HomeContent["homes"];
};

const ROW_HEIGHT = "h-56 md:h-[clamp(14rem,26vw,22rem)]";

type PhotoProps = HomeContent["homes"]["photos"]["wide"] & { className: string };

function Photo({ image, alt, className }: PhotoProps) {
  return (
    <div className={`overflow-hidden rounded-3xl bg-gray-100 ${className}`}>
      <img src={image} alt={alt ?? ""} loading="lazy" className="h-full w-full object-cover transition duration-700 hover:scale-[1.03]" />
    </div>
  );
}

/** Homepage "Find Homes With Soul": a photo mosaic of the kind of homes Ulô lists. */
export default function HomesWithSoulSection({ homes }: HomesWithSoulSectionProps) {
  const { photos } = homes;
  return (
    <section aria-labelledby="homes-with-soul-heading" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 id="homes-with-soul-heading" className="text-4xl font-medium tracking-tight text-gray-900 md:text-5xl">
            {homes.title}
          </h2>
          {homes.subtitle && <p className="mx-auto mt-4 max-w-md text-base text-gray-500 md:text-lg text-balance">{homes.subtitle}</p>}
        </div>

        <div className="mt-12 space-y-4 md:mt-16">
          <Photo {...photos.wide} className="h-56 md:h-auto md:aspect-[29/10]" />

          <div className="grid gap-4 md:grid-cols-[13fr_7fr]">
            <Photo {...photos.middleLeft} className={ROW_HEIGHT} />
            <Photo {...photos.middleRight} className={ROW_HEIGHT} />
          </div>

          <div className="grid gap-4 md:grid-cols-[7fr_13fr]">
            <Photo {...photos.tall} className="h-72 md:h-auto" />
            <div>
              <Photo {...photos.bottomRight} className={ROW_HEIGHT} />
              {homes.captionTitle && <p className="mt-5 text-lg font-medium text-gray-900">{homes.captionTitle}</p>}
              {homes.captionText && <p className="mt-1 text-sm text-gray-500">{homes.captionText}</p>}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/begin-your-journey"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600"
          >
            {homes.linkLabel} <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
