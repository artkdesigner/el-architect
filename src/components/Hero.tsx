import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import Navbar from './Navbar'
import heroImg1 from '../assets/hero-img-1.webp'
import heroImg2 from '../assets/hero-img-2.webp'

const TITLE = 'E.L.Architect'
const SLOGAN_LINES = ['From Context', 'to Concept']

interface LetterMaskProps {
  text: string
  animated: boolean
  registerRef?: (el: HTMLSpanElement | null, index: number) => void
}

function LetterMask({ text, animated, registerRef }: LetterMaskProps) {
  return (
    <>
      {text.split('').map((char, index) => (
        <span key={index} className="inline-block overflow-hidden">
          <span
            ref={animated ? (el) => registerRef?.(el, index) : undefined}
            className="inline-block"
          >
            {char === ' ' ? ' ' : char}
          </span>
        </span>
      ))}
    </>
  )
}

interface LineMaskProps {
  lines: string[]
  animated: boolean
  registerRef?: (el: HTMLSpanElement | null, index: number) => void
}

function LineMask({ lines, animated, registerRef }: LineMaskProps) {
  return (
    <>
      {lines.map((line, index) => (
        <span key={index} className="block overflow-hidden">
          <span
            ref={animated ? (el) => registerRef?.(el, index) : undefined}
            className="block"
          >
            {line}
          </span>
        </span>
      ))}
    </>
  )
}

function Hero() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const contentBlackRef = useRef<HTMLDivElement>(null)
  const contentWhiteRef = useRef<HTMLDivElement>(null)
  const heroImg1Ref = useRef<HTMLDivElement>(null)
  const heroImg2Ref = useRef<HTMLDivElement>(null)
  const titleLetterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const sloganLineRefs = useRef<(HTMLSpanElement | null)[]>([])
  const logoMaskRef = useRef<HTMLDivElement>(null)
  const ctaMaskRef = useRef<HTMLDivElement>(null)
  const burgerLine1Ref = useRef<HTMLSpanElement>(null)
  const burgerLine2Ref = useRef<HTMLSpanElement>(null)

  // Intro: title letters -> slogan lines -> Hero-img-1 rise (с синхронной сменой
  // цвета текста Hero-content с чёрного на белый по границе картинки) -> реавл навбара.
  useLayoutEffect(() => {
    const letters = titleLetterRefs.current.filter(
      (el): el is HTMLSpanElement => el !== null,
    )
    const lines = sloganLineRefs.current.filter(
      (el): el is HTMLSpanElement => el !== null,
    )
    const burgerLines = [burgerLine1Ref.current, burgerLine2Ref.current].filter(
      (el): el is HTMLSpanElement => el !== null,
    )
    const masks = [logoMaskRef.current, ctaMaskRef.current].filter(
      (el): el is HTMLDivElement => el !== null,
    )
    const img1 = heroImg1Ref.current
    const whiteOverlay = contentWhiteRef.current
    if (!img1 || !whiteOverlay) return

    gsap.set(letters, { yPercent: 100 })
    gsap.set(lines, { yPercent: 100 })
    gsap.set(img1, { yPercent: 100 })
    gsap.set(whiteOverlay, { clipPath: 'inset(100% 0 0 0)' })
    gsap.set(masks, { clipPath: 'inset(0 0 100% 0)' })
    gsap.set(burgerLines, { scaleX: 0 })

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reduceMotion) {
      gsap.set(letters, { yPercent: 0 })
      gsap.set(lines, { yPercent: 0 })
      gsap.set(img1, { yPercent: 0 })
      gsap.set(whiteOverlay, { clipPath: 'inset(0 0 0 0)' })
      gsap.set(masks, { clipPath: 'inset(0 0 0 0)' })
      gsap.set(burgerLines, { scaleX: 1 })
      return
    }

    let cancelled = false
    let tl: gsap.core.Timeline | undefined

    document.fonts.ready.then(() => {
      if (cancelled || !viewportRef.current || !contentBlackRef.current) return

      const containerHeight = viewportRef.current.clientHeight
      const contentTop = contentBlackRef.current.offsetTop

      tl = gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .to(letters, { yPercent: 0, duration: 0.6, stagger: 0.03 })
        .to(lines, { yPercent: 0, duration: 0.5, stagger: 0.1 })
        .to(img1, {
          yPercent: 0,
          duration: 1.1,
          ease: 'power2.inOut',
          onUpdate() {
            const progress = this.progress()
            const imgTop = (1 - progress) * containerHeight
            const clip = Math.min(
              Math.max(imgTop - contentTop, 0),
              containerHeight,
            )
            whiteOverlay.style.clipPath = `inset(${clip}px 0 0 0)`
          },
        })
        .to(
          masks,
          { clipPath: 'inset(0 0 0 0)', duration: 0.5, stagger: 0.1 },
          '<',
        )
        .to(burgerLines, { scaleX: 1, duration: 0.4, stagger: 0.15 }, '<')
    })

    return () => {
      cancelled = true
      tl?.kill()
    }
  }, [])

  // Scroll: Hero-img-2 наезжает поверх Hero-img-1 при скролле вниз по секции.
  useLayoutEffect(() => {
    let frame = 0

    const update = () => {
      const wrapper = viewportRef.current?.parentElement
      const revealImg = heroImg2Ref.current
      if (!wrapper || !revealImg) return

      const rect = wrapper.getBoundingClientRect()
      const progress = Math.min(Math.max(-rect.top / window.innerHeight, 0), 1)
      revealImg.style.transform = `translateY(${(1 - progress) * 100}%)`
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const contentClassName =
    'Hero-content flex w-full flex-col items-start gap-7.5 pb-4 whitespace-nowrap md:gap-10 md:pb-7.5 lg:flex-row lg:items-end lg:justify-between lg:gap-0 lg:pb-10'
  const titleClassName =
    'Hero-title text-[3.25rem] leading-none tracking-[-0.0975rem] lg:text-[7.5rem] lg:tracking-[-0.225rem] md:text-[5.625rem] md:tracking-[-0.16875rem]'
  const sloganClassName =
    'Hero-slogan text-xl leading-none lg:text-3xl md:text-3xl'

  return (
    <div className="Hero-wrapper relative h-[200vh]">
      <div
        ref={viewportRef}
        className="sticky top-0 h-screen overflow-hidden bg-white"
      >
        <div className="Hero relative isolate flex h-full flex-col items-start justify-center px-5">
          <Navbar
            logoMaskRef={logoMaskRef}
            ctaMaskRef={ctaMaskRef}
            burgerLineRefs={[burgerLine1Ref, burgerLine2Ref]}
          />

          <div className="relative z-[3] w-full">
            <div
              ref={contentBlackRef}
              className={`${contentClassName} text-[#171717]`}
            >
              <h1 className={titleClassName}>
                <LetterMask
                  text={TITLE}
                  animated
                  registerRef={(el, i) => {
                    titleLetterRefs.current[i] = el
                  }}
                />
              </h1>
              <p className={sloganClassName}>
                <LineMask
                  lines={SLOGAN_LINES}
                  animated
                  registerRef={(el, i) => {
                    sloganLineRefs.current[i] = el
                  }}
                />
              </p>
            </div>
            <div
              ref={contentWhiteRef}
              aria-hidden="true"
              className={`${contentClassName} pointer-events-none absolute inset-0 text-white`}
            >
              <p className={titleClassName}>
                <LetterMask text={TITLE} animated={false} />
              </p>
              <p className={sloganClassName}>
                <LineMask lines={SLOGAN_LINES} animated={false} />
              </p>
            </div>
          </div>

          <div
            ref={heroImg1Ref}
            className="Hero-img-1 absolute inset-0 z-[1] overflow-hidden"
          >
            <img
              src={heroImg1}
              alt="Жилой комплекс E.L. Architect с террасами и панорамным остеклением на фоне неба"
              className="absolute top-0 left-[-61.33%] h-full w-[387.96%] max-w-none object-cover md:left-[-5.14%] md:w-[238.89%] lg:left-[-0.02%] lg:w-[100.03%]"
              fetchPriority="high"
            />
          </div>

          <div
            ref={heroImg2Ref}
            className="Hero-img-2 absolute inset-0 z-[2]"
            style={{ transform: 'translateY(100%)' }}
          >
            <img
              src={heroImg2}
              alt="Крупный план фасада здания E.L. Architect"
              className="absolute inset-0 size-full max-w-none object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
