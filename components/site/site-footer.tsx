import Link from "next/link";
import { LogoLockup } from "@/components/site/seal";
import { CookieSettingsButton } from "@/components/site/analytics";
import { footerAreas, footerCuisines, urls } from "@/lib/site";

const flink = "block py-1.5 text-[13px] text-hfi-t2 hover:text-hfi-ink";
const fhead = "mb-[14px] text-[13.5px] font-bold tracking-[-.2px]";

export function SiteFooter({ currentAreaSlug }: { currentAreaSlug?: string }) {
  return (
    <footer className="border-t border-hfi-hair bg-hfi-band px-7 pb-[26px] pt-[52px] max-[640px]:px-5">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid grid-cols-[minmax(220px,1.6fr)_repeat(3,1fr)] gap-9 max-[1040px]:grid-cols-2 max-[1040px]:gap-8 max-[640px]:grid-cols-1 max-[640px]:gap-[26px]">
          <div className="max-[1040px]:col-span-full">
            <Link className="mb-[18px] inline-flex items-center gap-2.5 whitespace-nowrap" href={urls.home()}>
              <LogoLockup size={32} />
            </Link>
            <p className="m-0 max-w-[250px] text-[13px] leading-[1.7] text-hfi-t2">
              Greater Manchester&apos;s halal food guide. Listings are made in good faith, from what venues and local halal guides say.
              Spot something wrong? Use &ldquo;Report a change&rdquo; on the venue&apos;s page.
            </p>
          </div>
          <div>
            <h4 className={fhead}>Cuisines</h4>
            {footerCuisines.map((c) => (
              <Link key={c.label} href={c.href} className={flink}>
                {c.label}
              </Link>
            ))}
          </div>
          <div>
            <h4 className={fhead}>Areas</h4>
            {footerAreas.map((a) => (
              <Link
                key={a.slug}
                href={urls.area(a.slug)}
                className={flink}
                aria-current={a.slug === currentAreaSlug ? "page" : undefined}
              >
                {a.label}
              </Link>
            ))}
            <Link href={urls.flagship()} className={flink}>
              All areas
            </Link>
          </div>
          <div>
            <h4 className={fhead}>The Index</h4>
            <Link href={urls.about()} className={flink}>
              About our listings
            </Link>
            <Link href={urls.privacy()} className={flink}>
              Privacy
            </Link>
          </div>
        </div>

        <div className="mt-[30px] flex flex-wrap justify-between gap-[18px] border-t border-hfi-divider pt-5 text-[12.5px] text-hfi-t3">
          <span>&copy; {new Date().getFullYear()} The Halal Food Index</span>
          <nav className="flex gap-5" aria-label="Legal">
            <Link href={urls.privacy()}>Privacy</Link>
            <CookieSettingsButton />
          </nav>
        </div>
      </div>
    </footer>
  );
}
