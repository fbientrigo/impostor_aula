import Image from "next/image";

import flowerTopLeft from "@/assets/flower_topleft.png";
import flowerTopRight from "@/assets/flower_topright.png";
import flowerBotLeft from "@/assets/flower_botleft.png";
import flowerBotRight from "@/assets/flower_botright.png";

// Purely decorative desktop-only corner frame. Four flower PNGs are pinned to
// the viewport corners at `lg`+ (≥1024px) and hidden below it. The frame sits
// behind all content (z-0) and never intercepts pointer events, so it is a
// visual layer only. The app shells (`.app-shell-frame` in globals.css) add the
// matching desktop inset so header/content/signature clear these flowers.
//
// Where to change size: the `w-36 xl:w-56` classes below (height follows via
// `h-auto`, preserving each PNG's aspect ratio). Keep this in sync with the
// inset padding in `.app-shell-frame`.

const CORNER_SIZE = "h-auto w-36 xl:w-56";

export function DecorativeFrame() {
  return (
    <div aria-hidden="true" className="pointer-events-none hidden select-none lg:block">
      <Image
        src={flowerTopLeft}
        alt=""
        priority={false}
        className={`fixed left-0 top-0 z-0 ${CORNER_SIZE}`}
      />
      <Image
        src={flowerTopRight}
        alt=""
        priority={false}
        className={`fixed right-0 top-0 z-0 ${CORNER_SIZE}`}
      />
      <Image
        src={flowerBotLeft}
        alt=""
        priority={false}
        className={`fixed bottom-0 left-0 z-0 ${CORNER_SIZE}`}
      />
      <Image
        src={flowerBotRight}
        alt=""
        priority={false}
        className={`fixed bottom-0 right-0 z-0 ${CORNER_SIZE}`}
      />
    </div>
  );
}
