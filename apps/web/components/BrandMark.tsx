/**
 * MonkStash mark: a hooded monk, eyes closed in quiet meditation, with the orange sprig.
 * The hood uses currentColor and the face is a true cut-out (even-odd fill), so the mark
 * works on any background: dark hood on paper, light hood on the dark footer. The sprig
 * stays Monero orange, the one deliberate nod to Monero. Original artwork, not a
 * third-party logo, and never combined with the Monero symbol.
 */
export function BrandMark({ className = "brand-mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="11 2 49 66" fill="none" aria-hidden="true" focusable="false">
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M11 60 C11 33 19 12 32 10 C45 12 53 33 53 60 Z M21.5 60 C21.5 42 25.5 29.5 32 27.5 C38.5 29.5 42.5 42 42.5 60 Z"
      />
      <path d="M25.6 41 q2.4 2.6 4.8 0 M33.6 41 q2.4 2.6 4.8 0" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M44 13 q8 -2 12 -11 q-10 0 -12 9 z" fill="#f26822" />
      <path d="M47 18 q8 1 13 -6 q-9 -2 -13 5 z" fill="#f26822" />
    </svg>
  );
}
