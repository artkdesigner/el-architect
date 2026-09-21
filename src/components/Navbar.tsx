import type { RefObject } from 'react'

interface NavbarProps {
  logoMaskRef?: RefObject<HTMLDivElement | null>
  ctaMaskRef?: RefObject<HTMLDivElement | null>
  burgerLineRefs?: [
    RefObject<HTMLSpanElement | null>,
    RefObject<HTMLSpanElement | null>,
  ]
}

function Navbar({ logoMaskRef, ctaMaskRef, burgerLineRefs }: NavbarProps) {
  return (
    <nav
      className="Navbar fixed inset-x-0 top-4 z-50 flex items-center justify-between px-4 md:top-5 md:px-5"
      aria-label="Основная навигация"
    >
      <div
        ref={logoMaskRef}
        className="Navbar-logo-mask h-5 w-fit overflow-hidden md:h-5.75 lg:h-8.5"
      >
        <a
          href="/"
          className="Navbar-logo block text-sm leading-[1.4] whitespace-nowrap text-white uppercase md:text-base lg:text-2xl"
        >
          E.L.
        </a>
      </div>
      <button
        type="button"
        aria-label="Открыть меню"
        className="Navbar-burger absolute top-1/2 left-1/2 flex w-12.5 -translate-x-1/2 -translate-y-1/2 flex-col gap-1.5 md:w-15 md:gap-2.5 lg:w-25"
      >
        <span
          ref={burgerLineRefs?.[0]}
          className="Navbar-burger-line h-px w-full origin-left bg-white md:h-[2px]"
        />
        <span
          ref={burgerLineRefs?.[1]}
          className="Navbar-burger-line h-px w-full origin-left bg-white md:h-[2px]"
        />
      </button>
      <div
        ref={ctaMaskRef}
        className="Navbar-cta-mask h-5 w-fit overflow-hidden md:h-5.75 lg:h-8.5"
      >
        <a
          href="#contact"
          className="Navbar-cta block text-sm leading-[1.4] whitespace-nowrap text-white md:text-base lg:text-2xl"
        >
          Get in Touch
        </a>
      </div>
    </nav>
  )
}

export default Navbar
