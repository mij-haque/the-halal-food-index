import { sealSvg } from "@/lib/art";
import { SITE_NAME } from "@/lib/site";

/** Seal + wordmark lockup, identical on every page. */
export function LogoLockup({ size = 32 }: { size?: number }) {
  return (
    <>
      <span className="flex shrink-0" dangerouslySetInnerHTML={{ __html: sealSvg(size) }} />
      <span className="hfi-wordmark shrink-0">{SITE_NAME}</span>
    </>
  );
}
