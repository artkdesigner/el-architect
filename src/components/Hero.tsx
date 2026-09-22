import { useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'
import heroImg1 from '../assets/hero-img-1.webp'
import heroImg2 from '../assets/hero-img-2.webp'
import heroImg3 from '../assets/hero-img-3.webp'

const TITLE = 'E.L.Architect'
const SLOGAN_LINES = ['From Context', 'to Concept']

// Hero-img-1 остаётся базовым слоем (свой Figma-кроп на каждом брейкпоинте,
// поднимается интро-анимацией). 2..3 — каскад, который наезжает по одному
// поверх предыдущего при скролле; у них нет авторского кропа под tablet/mobile,
// поэтому используем object-cover.
const CASCADE_IMAGES = [heroImg2, heroImg3]

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

interface HeroProps {
  navbarMaskRefs: [
    RefObject<HTMLDivElement | null>,
    RefObject<HTMLDivElement | null>,
  ]
  navbarBurgerLineRefs: [
    RefObject<HTMLSpanElement | null>,
    RefObject<HTMLSpanElement | null>,
  ]
}

function Hero({ navbarMaskRefs, navbarBurgerLineRefs }: HeroProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const contentBlackRef = useRef<HTMLDivElement>(null)
  const contentWhiteRef = useRef<HTMLDivElement>(null)
  const heroImg1Ref = useRef<HTMLDivElement>(null)
  const heroImg1OverlayRef = useRef<HTMLDivElement>(null)
  const cascadeRefs = useRef<(HTMLDivElement | null)[]>([])
  const cascadeOverlayRefs = useRef<(HTMLDivElement | null)[]>([])
  const titleLetterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const sloganLineRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [logoMaskRef, ctaMaskRef] = navbarMaskRefs
  const [burgerLine1Ref, burgerLine2Ref] = navbarBurgerLineRefs

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
    gsap.set(masks, { clipPath: 'inset(0% 0% 100% 0%)' })
    gsap.set(burgerLines, { scaleX: 0 })

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reduceMotion) {
      gsap.set(letters, { yPercent: 0 })
      gsap.set(lines, { yPercent: 0 })
      gsap.set(img1, { yPercent: 0 })
      gsap.set(whiteOverlay, { clipPath: 'inset(0 0 0 0)' })
      gsap.set(masks, { clipPath: 'inset(0% 0% 0% 0%)' })
      gsap.set(burgerLines, { scaleX: 1 })
      return
    }

    let cancelled = false
    let tl: gsap.core.Timeline | undefined

    document.fonts.ready.then(() => {
      if (cancelled || !viewportRef.current || !contentBlackRef.current) return

      const containerHeight = viewportRef.current.clientHeight
      const viewportTop = viewportRef.current.getBoundingClientRect().top
      const contentTop =
        contentBlackRef.current.getBoundingClientRect().top - viewportTop

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
        .to(masks, {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1,
          stagger: 0.2,
          ease: 'power1.inOut',
        })
        .to(burgerLines, { scaleX: 1, duration: 0.4, stagger: 0.15 }, '<')
    })

    return () => {
      cancelled = true
      tl?.kill()
    }
  }, [logoMaskRef, ctaMaskRef, burgerLine1Ref, burgerLine2Ref])

  // Scroll: Hero-img-2..3 наезжают по очереди друг на друга по мере скролла секции,
  // каждой картинке — равная доля от общей высоты скролл-зоны. У слоя, который
  // накрывают, поверх картинки темнеет оверлей (0 -> 50% Dark) синхронно
  // с прогрессом наезда следующего слоя.
  useLayoutEffect(() => {
    let frame = 0
    const steps = cascadeRefs.current.length

    const update = () => {
      const wrapper = viewportRef.current?.parentElement
      if (!wrapper || steps === 0) return

      const rect = wrapper.getBoundingClientRect()
      const totalScrollPx = steps * window.innerHeight
      const scrolledPx = Math.min(Math.max(-rect.top, 0), totalScrollPx)

      const stepProgressAt = (index: number) =>
        Math.min(Math.max(scrolledPx / window.innerHeight - index, 0), 1)

      const heroImg1Overlay = heroImg1OverlayRef.current
      if (heroImg1Overlay) {
        heroImg1Overlay.style.opacity = String(stepProgressAt(0) * 0.5)
      }

      cascadeRefs.current.forEach((el, index) => {
        if (!el) return
        const stepProgress = stepProgressAt(index)
        el.style.transform = `translateY(${(1 - stepProgress) * 100}%)`

        // Оверлей на ЭТОМ слое темнеет по мере того, как следующая картинка
        // наезжает на него (0 -> 50% Dark), а не по своему собственному прогрессу.
        const overlay = cascadeOverlayRefs.current[index]
        if (overlay) {
          const nextProgress = index + 1 < steps ? stepProgressAt(index + 1) : 0
          overlay.style.opacity = String(nextProgress * 0.5)
        }
      })
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
    'Hero-slogan text-xl leading-none lg:w-[18.6875rem] lg:-translate-y-[0.473rem] lg:text-[2rem] md:text-[2rem]'

  return (
    <div className="Hero-wrapper relative h-[300vh]">
      <div
        ref={viewportRef}
        className="sticky top-0 h-screen overflow-hidden bg-white"
      >
        <div className="Hero relative isolate flex h-full flex-col items-start justify-center px-5">
          <div className="relative z-[11] w-full">
            <div
              ref={contentBlackRef}
              className={`${contentClassName} text-ink`}
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
            <div
              ref={heroImg1OverlayRef}
              aria-hidden="true"
              className="Hero-img-overlay pointer-events-none absolute inset-0 bg-ink opacity-0"
            />
          </div>

          {CASCADE_IMAGES.map((src, index) => (
            <div
              key={src}
              ref={(el) => {
                cascadeRefs.current[index] = el
              }}
              className="Hero-img absolute inset-0"
              style={{ zIndex: index + 2, transform: 'translateY(100%)' }}
            >
              <img
                src={src}
                alt={`Проект E.L. Architect, вид ${index + 2}`}
                className="absolute inset-0 size-full max-w-none object-cover"
                loading="lazy"
              />
              <div
                ref={(el) => {
                  cascadeOverlayRefs.current[index] = el
                }}
                aria-hidden="true"
                className="Hero-img-overlay pointer-events-none absolute inset-0 bg-ink opacity-0"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Hero
