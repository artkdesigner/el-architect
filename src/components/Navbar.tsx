import type { Ref } from 'react'

interface NavbarProps {
  logoMaskRef?: Ref<HTMLDivElement>
  ctaMaskRef?: Ref<HTMLDivElement>
  burgerLineRefs?: [Ref<HTMLSpanElement>, Ref<HTMLSpanElement>]
}

function Navbar({ logoMaskRef, ctaMaskRef, burgerLineRefs }: NavbarProps) {
  return (
    <nav
      className="Navbar absolute inset-x-0 top-5 z-[4] flex items-center justify-between px-4 md:px-5"
      aria-label="Основная навигация"
    >
      <div
        ref={logoMaskRef}
        className="Navbar-logo-mask h-8.5 w-fit overflow-hidden"
      >
        <a
          href="/"
          className="Navbar-logo block text-2xl leading-[1.4] whitespace-nowrap text-white uppercase"
        >
          E.L.
        </a>
      </div>
      <button
        type="button"
        aria-label="Открыть меню"
        className="Navbar-burger absolute top-1/2 left-1/2 flex w-25 -translate-x-1/2 -translate-y-1/2 flex-col gap-2.5"
      >
        <span
          ref={burgerLineRefs?.[0]}
          className="Navbar-burger-line h-0.5 w-full origin-left bg-white"
        />
        <span
          ref={burgerLineRefs?.[1]}
          className="Navbar-burger-line h-0.5 w-full origin-left bg-white"
        />
      </button>
      <div
        ref={ctaMaskRef}
        className="Navbar-cta-mask h-8.5 w-fit overflow-hidden"
      >
        <a
          href="#contact"
          className="Navbar-cta block text-2xl leading-[1.4] whitespace-nowrap text-white"
        >
          Get in Touch
        </a>
      </div>
    </nav>
  )
}

export default Navbar
