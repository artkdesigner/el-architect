import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LetterMask } from '../lib/textMask'
import stepsCard1 from '../assets/steps/steps-card-1.webp'
import stepsCard2 from '../assets/steps/steps-card-2.webp'
import stepsCard3 from '../assets/steps/steps-card-3.webp'
import stepsCard4 from '../assets/steps/steps-card-4.webp'
import stepsCard5 from '../assets/steps/steps-card-5.webp'
import stepsCard6 from '../assets/steps/steps-card-6.webp'

interface Step {
  name: string
  year: string
  description: string
  image: string
  imageClassName?: string
}

const STEPS: Step[] = [
  {
    name: 'Atrium',
    year: '2007 — 2010',
    description:
      'My first language is architecture. Here I learned the discipline of thought: how to distill a crystal-clear structure from a jumble of ideas. This is a school of hierarchy and order, where the essential subordinates the unimportant.',
    image: stepsCard1,
    imageClassName: 'object-bottom',
  },
  {
    name: 'Afa Group',
    year: '2014 – 2016',
    description:
      'Human scale. Here I rediscovered that architecture speaks not only through forms and volumes, but through tactility, everyday experience, emotional response. A lesson in how an environment can be warm, responsive, and nurturing — bringing architecture back into direct dialogue with people.',
    image: stepsCard2,
  },
  {
    name: 'Skuratov Architects',
    year: '2017 – 2018',
    description:
      'From sketch to built form — a path of discipline. The hardest and most valuable lesson: how an author’s vision withstands the harsh test of reality, drawings, construction site. Mastery of translating ideas into material.',
    image: stepsCard3,
  },
  {
    name: 'ABD (Dialogue)',
    year: '2018 – 2020',
    description:
      "Here, architecture first appeared to me not as the art of pure ideas, but as a dialogue with reality. Commercial projects require a different way of thinking. I learned to see architecture through the eyes of an investor and find a balance between aesthetics and practicality. The ability to adapt an idea to reality isn't a concession, but a tool that enables a project to succeed where pure idealism fails.",
    image: stepsCard4,
  },
  {
    name: 'Ginzburg Architects',
    year: '2021 – 2022',
    description:
      'Scale and responsibility. Here architecture revealed itself as part of the city’s history. I learned to work with context not as a constraint, but as a rich material for creating new layers of meaning.',
    image: stepsCard5,
  },
  {
    name: 'Eran Mebel Architects',
    year: '2022 - Present',
    description:
      "Adaptation as survival and growth. Moving to a new country is a stress test for any method. Here I didn't just learn new codes and language. I took on the challenge of running dozens of projects simultaneously, from sketch to completion, in a completely different cultural and market environment. This experience tempered my approach, proving that truly adaptive architecture knows no borders. It works where others retreat.",
    image: stepsCard6,
  },
]

gsap.registerPlugin(ScrollTrigger)

// Константы макета (px в референсной ширине 1920, см. get_metadata по кадрам
// Steps-01..Steps-09) переводятся в rem при использовании в className, и в px
// через текущий rootFontSize при использовании в GSAP-трансформах.
const ROW_REM = 22.8125 // 365px = высота карточки + 20px гап — шаг наезда/смещения карточек
const NAME_STEP_REM = 2.5 // 40px — шаг оседания имени/года в накопленном стеке
const NAME_WAIT_BASE_REM = 50.25 // 804px — стартовая (нижняя, «в очереди») позиция первого имени/года
const TITLE_EXIT_REM = -41.0625 // -657px — насколько title-wrap уезжает вверх при выходе

function Steps() {
  const introWrapperRef = useRef<HTMLDivElement>(null)
  const titleWrapRef = useRef<HTMLDivElement>(null)
  const titleLeftRef = useRef<HTMLParagraphElement>(null)
  const titleRightRef = useRef<HTMLParagraphElement>(null)
  const titleLetterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const cardsShiftRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const imgWrapRefs = useRef<(HTMLDivElement | null)[]>([])
  const descRefs = useRef<(HTMLParagraphElement | null)[]>([])
  const nameListWrapRef = useRef<HTMLDivElement>(null)
  const yearListWrapRef = useRef<HTMLDivElement>(null)
  const nameRefs = useRef<(HTMLParagraphElement | null)[]>([])
  const yearRefs = useRef<(HTMLParagraphElement | null)[]>([])

  // Пиновая сцена Steps целиком, по скроллу (scrub), без фиксированной
  // длительности:
  //  A. буквы Steps-title-wrap поднимаются из-за маски и проявляются;
  //  B. title-left/-right расходятся к краям контейнера, все 6 steps-card-img
  //     одновременно растут в ширину 0 -> 100% (наложены друг на друга);
  //  C. карточки 1..5 разъезжаются вниз (карточка 0 остаётся на месте),
  //     title-wrap уезжает вверх и гаснет до 20% (гаснет к моменту, когда
  //     пересекает верхнюю границу секции), проявляются name-list/year-list
  //     и description первой карточки, имя/год первой карточки оседают и
  //     становятся активными (opacity 100%);
  //  D. цикл на каждую следующую карточку (i=1..5): предыдущая карточка
  //     уезжает вверх на ROW (общим сдвигом ленты), её img гаснет до 20%,
  //     description исчезает; имя/год предыдущей гаснут до 20% (позиция не
  //     меняется); новая карточка становится активной (img/description ->
  //     100%), её имя/год приезжают в свою ячейку накопленного стека и
  //     становятся активными (opacity 100%).
  useLayoutEffect(() => {
    const letters = titleLetterRefs.current.filter(
      (el): el is HTMLSpanElement => el !== null,
    )
    const wrapperEl = introWrapperRef.current
    const titleWrap = titleWrapRef.current
    const titleLeft = titleLeftRef.current
    const titleRight = titleRightRef.current
    const cardsShift = cardsShiftRef.current
    const cards = cardRefs.current
    const imgWraps = imgWrapRefs.current
    const descs = descRefs.current
    const names = nameRefs.current
    const years = yearRefs.current
    const nameListWrap = nameListWrapRef.current
    const yearListWrap = yearListWrapRef.current

    if (
      !wrapperEl ||
      !titleWrap ||
      !titleLeft ||
      !titleRight ||
      !cardsShift ||
      !nameListWrap ||
      !yearListWrap ||
      letters.length === 0 ||
      cards.some((el) => el === null) ||
      imgWraps.some((el) => el === null) ||
      descs.some((el) => el === null) ||
      names.some((el) => el === null) ||
      years.some((el) => el === null)
    ) {
      return
    }

    const lastIndex = STEPS.length - 1

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reduceMotion) {
      gsap.set(letters, { yPercent: 0, opacity: 1 })
      gsap.set(titleWrap, { opacity: 0.2 })
      gsap.set(imgWraps, { clipPath: 'inset(0% 0% 0% 0%)' })
      gsap.set(cards, { y: 0 })
      gsap.set(cardsShift, { y: `-${lastIndex * ROW_REM}rem` })
      imgWraps.forEach((el, i) =>
        gsap.set(el, { opacity: i === lastIndex ? 1 : 0.2 }),
      )
      descs.forEach((el, i) =>
        gsap.set(el, { opacity: i === lastIndex ? 1 : 0 }),
      )
      gsap.set(nameListWrap, { opacity: 1 })
      gsap.set(yearListWrap, { opacity: 1 })
      names.forEach((el, i) =>
        gsap.set(el, {
          top: `${i * NAME_STEP_REM}rem`,
          opacity: i === lastIndex ? 1 : 0.2,
        }),
      )
      years.forEach((el, i) =>
        gsap.set(el, {
          top: `${i * NAME_STEP_REM}rem`,
          opacity: i === lastIndex ? 1 : 0.2,
        }),
      )
      return
    }

    gsap.set(letters, { yPercent: 100, opacity: 0 })
    gsap.set(imgWraps, { clipPath: 'inset(0% 50% 0% 50%)' })
    gsap.set(imgWraps.slice(1), { opacity: 0.2 })
    gsap.set(descs, { opacity: 0 })
    gsap.set(cards, { y: 0 })
    gsap.set(cardsShift, { y: 0 })
    gsap.set(nameListWrap, { opacity: 0 })
    gsap.set(yearListWrap, { opacity: 0 })
    gsap.set(names, { opacity: 0.2 })
    gsap.set(years, { opacity: 0.2 })

    let cancelled = false
    let ctx: gsap.Context | undefined

    document.fonts.ready.then(() => {
      if (cancelled) return

      const rootFontSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      )
      const px = (rem: number) => rem * rootFontSize

      // Стартовое положение имён/годов — «в очереди», внизу списка.
      gsap.set(names, {
        top: (i) => `${NAME_WAIT_BASE_REM + i * NAME_STEP_REM}rem`,
      })
      gsap.set(years, {
        top: (i) => `${NAME_WAIT_BASE_REM + i * NAME_STEP_REM}rem`,
      })

      // Стартовое состояние title-left/-right: сведены к центру (как в
      // предыдущем шаге), раскладка justify-between уже финальная.
      const gapPx = rootFontSize * 1.25 // gap-5
      const wrapRect = titleWrap.getBoundingClientRect()
      const leftRect = titleLeft.getBoundingClientRect()
      const rightRect = titleRight.getBoundingClientRect()
      const totalWidth = leftRect.width + gapPx + rightRect.width
      const centeredLeftX = wrapRect.left + (wrapRect.width - totalWidth) / 2
      const leftStartX = centeredLeftX - leftRect.left
      const rightStartX =
        centeredLeftX + leftRect.width + gapPx - rightRect.left
      gsap.set(titleLeft, { x: leftStartX })
      gsap.set(titleRight, { x: rightStartX })

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapperEl,
            start: 'top top',
            end: '+=1062.5%',
            scrub: 0.5,
            pin: true,
          },
        })

        // A. буквы
        tl.to(letters, {
          yPercent: 0,
          opacity: 1,
          stagger: 0.05,
          ease: 'power2.out',
          duration: 1,
        })

        // B. title расходится к краям + все steps-card-img раскрываются из
        // центра симметрично в обе стороны (clip-path вместо роста ширины,
        // чтобы точка раскрытия совпадала с центром экрана, а не с левым
        // краем карточки)
        tl.to([titleLeft, titleRight], {
          x: 0,
          duration: 1,
          ease: 'power2.inOut',
        })
        tl.to(
          imgWraps,
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1,
            ease: 'power2.inOut',
          },
          '<',
        )

        // C. карточки 1..5 разъезжаются вниз; title уезжает вверх (в 2 раза
        // дольше, чтобы уход не был резким) и гаснет.
        cards.forEach((card, i) => {
          if (i === 0) return
          tl.to(
            card,
            { y: px(i * ROW_REM), duration: 1, ease: 'power2.inOut' },
            i === 1 ? undefined : '<',
          )
        })
        tl.to(
          titleWrap,
          { y: px(TITLE_EXIT_REM), duration: 2, ease: 'power2.inOut' },
          '<',
        )
        tl.to(
          titleWrap,
          { opacity: 0.2, duration: 1.32, ease: 'power1.out' },
          '<',
        )

        // только после того как карточки разъехались — проявляются списки
        // имён/годов и описание первой карточки.
        tl.to([nameListWrap, yearListWrap], { opacity: 1, duration: 0.5 })
        tl.to(
          descs[0],
          { opacity: 1, duration: 0.5, ease: 'power1.out' },
          '<',
        )

        // и только затем имя/год первой карточки оседают на верхнюю позицию.
        tl.to(names[0], {
          top: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power1.out',
        })
        tl.to(
          years[0],
          { top: 0, opacity: 1, duration: 0.5, ease: 'power1.out' },
          '<',
        )

        // D. цикл по остальным карточкам: предыдущая уезжает и гаснет,
        // следующая занимает её место и активируется.
        for (let i = 1; i <= lastIndex; i++) {
          const prev = i - 1
          tl.to(cardsShift, {
            y: px(-i * ROW_REM),
            duration: 1,
            ease: 'power2.inOut',
          })
          tl.to(
            imgWraps[prev],
            { opacity: 0.2, duration: 1, ease: 'power2.inOut' },
            '<',
          )
          tl.to(
            descs[prev],
            { opacity: 0, duration: 1, ease: 'power2.inOut' },
            '<',
          )
          tl.to(names[prev], { opacity: 0.2, duration: 1 }, '<')
          tl.to(years[prev], { opacity: 0.2, duration: 1 }, '<')
          tl.to(
            imgWraps[i],
            { opacity: 1, duration: 1, ease: 'power2.inOut' },
            '<',
          )
          tl.to(
            descs[i],
            { opacity: 1, duration: 1, ease: 'power2.inOut' },
            '<',
          )
          tl.to(
            names[i],
            {
              top: `${i * NAME_STEP_REM}rem`,
              opacity: 1,
              duration: 1,
              ease: 'power2.inOut',
            },
            '<',
          )
          tl.to(
            years[i],
            {
              top: `${i * NAME_STEP_REM}rem`,
              opacity: 1,
              duration: 1,
              ease: 'power2.inOut',
            },
            '<',
          )
        }
      }, wrapperEl)
    })

    return () => {
      cancelled = true
      ctx?.revert()
    }
  }, [])

  return (
    <section className="Steps hidden bg-ink lg:block">
      <div ref={introWrapperRef} className="Steps-intro relative h-screen">
        <div className="sticky top-0 h-screen overflow-hidden">
          <div
            ref={titleWrapRef}
            className="Steps-title-wrap absolute top-1/2 left-1/2 flex h-[13.125rem] w-[103.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-between leading-none tracking-[0em] text-white"
          >
            <p ref={titleLeftRef} className="Steps-title-left text-[10rem]">
              <LetterMask
                text="Steps"
                animated
                mask={false}
                compress
                registerRef={(el, i) => {
                  titleLetterRefs.current[i] = el
                }}
              />
            </p>
            <p ref={titleRightRef} className="Steps-title-right text-[10rem]">
              <LetterMask
                text="Taken"
                animated
                mask={false}
                compress
                registerRef={(el, i) => {
                  titleLetterRefs.current[5 + i] = el
                }}
              />
            </p>
          </div>

          <div
            ref={nameListWrapRef}
            className="Steps-card-name-list absolute bottom-5 left-5 h-[65rem] w-[38.3125rem]"
          >
            {STEPS.map((step, i) => (
              <p
                key={step.name}
                ref={(el) => {
                  nameRefs.current[i] = el
                }}
                className="Steps-card-name absolute left-0 text-[2.25rem] leading-none text-white"
              >
                {step.name}
              </p>
            ))}
          </div>

          <div className="Steps-cards absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              ref={cardsShiftRef}
              className="Steps-cards-shift relative h-[21.5625rem] w-[38.375rem]"
            >
              {STEPS.map((step, i) => (
                <div
                  key={step.name}
                  ref={(el) => {
                    cardRefs.current[i] = el
                  }}
                  className="Steps-card absolute top-0 left-0 flex h-[21.5625rem] items-start gap-5 bg-ink"
                  style={{ zIndex: STEPS.length - i }}
                >
                  <div
                    ref={(el) => {
                      imgWrapRefs.current[i] = el
                    }}
                    className="steps-card-img h-[21.5625rem] w-[38.375rem] shrink-0 overflow-hidden"
                  >
                    <img
                      src={step.image}
                      alt={`Проект «${step.name}», ${step.year}`}
                      className={`size-full object-cover ${step.imageClassName ?? ''}`}
                    />
                  </div>
                  <p
                    ref={(el) => {
                      descRefs.current[i] = el
                    }}
                    className="Steps-card-description mt-5 w-[18.5rem] shrink-0 indent-[2.25rem] text-[1rem] leading-[1.2] tracking-[-0.03rem] text-white"
                  >
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            ref={yearListWrapRef}
            className="Steps-card-year-list absolute bottom-5 right-5 h-[65rem] w-[38.3125rem] text-right"
          >
            {STEPS.map((step, i) => (
              <p
                key={step.name}
                ref={(el) => {
                  yearRefs.current[i] = el
                }}
                className="Steps-card-year absolute right-0 text-[2.5rem] leading-none tracking-[-0.125rem] text-white"
              >
                {step.year}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Steps
