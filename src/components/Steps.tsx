import { useRef } from 'react'
import { LetterMask } from '../lib/textMask'
import { useStepsScene } from '../lib/useStepsScene'
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

// Константы макета (px в референсной ширине 1920, см. get_metadata по кадрам
// Steps-01..Steps-09) переводятся в rem при использовании в className, и в px
// через текущий rootFontSize при использовании в GSAP-трансформах (см.
// useStepsScene — архитектура сцены общая для всех брейкпоинтов).
const ROW_REM = 22.8125 // 365px = высота карточки + 20px гап — шаг наезда/смещения карточек
const CARD_W_REM = 38.375 // 614px — финальная ширина steps-card-img
const NAME_STEP_REM = 2.5 // 40px — шаг оседания имени/года в накопленном стеке
const NAME_STOP_REM = 6.25 // 100px — итоговая позиция остановки имени/года ниже верха списка
const NAME_WAIT_BASE_REM = 50.25 // 804px — стартовая (нижняя, «в очереди») позиция первого имени/года
const TITLE_EXIT_REM = -47.3125 // -757px — насколько title-wrap уезжает вверх при выходе

// Планшет (md, референс-фрейм 768px, см. get_metadata по фреймам Steps в
// Figma). Та же архитектура сцены, что на десктопе — другие размеры/отступы
// и нет Steps-card-description.
const TABLET_ROW_REM = 13.125 // 210px = высота карточки (200) + gap (10)
const TABLET_CARD_W_REM = 22.5 // 360px — финальная ширина steps-card-img
const TABLET_NAME_STEP_REM = 1.75 // 28px — шаг оседания имени/года в стеке
const TABLET_NAME_STOP_REM = 0 // позиция остановки имени/года — вплотную к верху списка
const TABLET_NAME_WAIT_BASE_REM = 47.5 // стартовая («в очереди») позиция первого имени/года
const TABLET_TITLE_EXIT_REM = -43.875 // -702px — уход title-wrap вверх при выходе
const TABLET_TITLE_GAP_REM = 0.375 // зазор между title-left/-right при сведении к центру

// Мобильный (референс-фрейм 375px, см. get_metadata по фреймам Steps в
// Figma). Та же архитектура сцены — другие размеры/отступы, нет
// Steps-card-description. Title-wrap шире реального макета: по просьбе
// пользователя Steps/Taken должны разъезжаться за пределы экрана, а не
// просто к краям 343px-контейнера из Figma.
const MOBILE_ROW_REM = 8.625 // 138px = высота карточки (128) + gap (10)
const MOBILE_CARD_W_REM = 14.125 // 226px — финальная ширина steps-card-img
const MOBILE_NAME_STEP_REM = 1.5 // 24px — шаг оседания имени/года в стеке
const MOBILE_NAME_STOP_REM = 0 // позиция остановки имени/года — вплотную к верху списка
const MOBILE_NAME_WAIT_BASE_REM = 40 // стартовая («в очереди») позиция первого имени/года
const MOBILE_TITLE_EXIT_REM = -37.25 // -596px — уход title-wrap вверх при выходе
const MOBILE_TITLE_GAP_REM = 0.375 // зазор между title-left/-right при сведении к центру

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

  // Планшет — та же архитектура сцены (см. useStepsScene), только размеры
  // и отступы другие, и нет Steps-card-description (на планшете карточка —
  // только изображение, решение подтверждено с пользователем).
  const introWrapperRefT = useRef<HTMLDivElement>(null)
  const titleWrapRefT = useRef<HTMLDivElement>(null)
  const titleLeftRefT = useRef<HTMLParagraphElement>(null)
  const titleRightRefT = useRef<HTMLParagraphElement>(null)
  const titleLetterRefsT = useRef<(HTMLSpanElement | null)[]>([])
  const cardsShiftRefT = useRef<HTMLDivElement>(null)
  const cardRefsT = useRef<(HTMLDivElement | null)[]>([])
  const imgWrapRefsT = useRef<(HTMLDivElement | null)[]>([])
  const nameListWrapRefT = useRef<HTMLDivElement>(null)
  const yearListWrapRefT = useRef<HTMLDivElement>(null)
  const nameRefsT = useRef<(HTMLParagraphElement | null)[]>([])
  const yearRefsT = useRef<(HTMLParagraphElement | null)[]>([])

  // Мобильная сцена — та же архитектура, свои размеры/отступы, тоже без
  // Steps-card-description.
  const introWrapperRefM = useRef<HTMLDivElement>(null)
  const titleWrapRefM = useRef<HTMLDivElement>(null)
  const titleLeftRefM = useRef<HTMLParagraphElement>(null)
  const titleRightRefM = useRef<HTMLParagraphElement>(null)
  const titleLetterRefsM = useRef<(HTMLSpanElement | null)[]>([])
  const cardsShiftRefM = useRef<HTMLDivElement>(null)
  const cardRefsM = useRef<(HTMLDivElement | null)[]>([])
  const imgWrapRefsM = useRef<(HTMLDivElement | null)[]>([])
  const nameListWrapRefM = useRef<HTMLDivElement>(null)
  const yearListWrapRefM = useRef<HTMLDivElement>(null)
  const nameRefsM = useRef<(HTMLParagraphElement | null)[]>([])
  const yearRefsM = useRef<(HTMLParagraphElement | null)[]>([])

  useStepsScene(
    () => ({
      wrapperEl: introWrapperRef.current,
      titleWrap: titleWrapRef.current,
      titleLeft: titleLeftRef.current,
      titleRight: titleRightRef.current,
      letters: titleLetterRefs.current,
      cardsShift: cardsShiftRef.current,
      cards: cardRefs.current,
      imgWraps: imgWrapRefs.current,
      descs: descRefs.current,
      nameListWrap: nameListWrapRef.current,
      yearListWrap: yearListWrapRef.current,
      names: nameRefs.current,
      years: yearRefs.current,
    }),
    {
      stepsCount: STEPS.length,
      rowRem: ROW_REM,
      cardWRem: CARD_W_REM,
      nameStepRem: NAME_STEP_REM,
      nameStopRem: NAME_STOP_REM,
      nameWaitBaseRem: NAME_WAIT_BASE_REM,
      titleExitRem: TITLE_EXIT_REM,
      hasDescription: true,
    },
  )

  useStepsScene(
    () => ({
      wrapperEl: introWrapperRefT.current,
      titleWrap: titleWrapRefT.current,
      titleLeft: titleLeftRefT.current,
      titleRight: titleRightRefT.current,
      letters: titleLetterRefsT.current,
      cardsShift: cardsShiftRefT.current,
      cards: cardRefsT.current,
      imgWraps: imgWrapRefsT.current,
      descs: [],
      nameListWrap: nameListWrapRefT.current,
      yearListWrap: yearListWrapRefT.current,
      names: nameRefsT.current,
      years: yearRefsT.current,
    }),
    {
      stepsCount: STEPS.length,
      rowRem: TABLET_ROW_REM,
      cardWRem: TABLET_CARD_W_REM,
      nameStepRem: TABLET_NAME_STEP_REM,
      nameStopRem: TABLET_NAME_STOP_REM,
      nameWaitBaseRem: TABLET_NAME_WAIT_BASE_REM,
      titleExitRem: TABLET_TITLE_EXIT_REM,
      titleGapRem: TABLET_TITLE_GAP_REM,
      hasDescription: false,
      endPercent: 928,
    },
  )

  useStepsScene(
    () => ({
      wrapperEl: introWrapperRefM.current,
      titleWrap: titleWrapRefM.current,
      titleLeft: titleLeftRefM.current,
      titleRight: titleRightRefM.current,
      letters: titleLetterRefsM.current,
      cardsShift: cardsShiftRefM.current,
      cards: cardRefsM.current,
      imgWraps: imgWrapRefsM.current,
      descs: [],
      nameListWrap: nameListWrapRefM.current,
      yearListWrap: yearListWrapRefM.current,
      names: nameRefsM.current,
      years: yearRefsM.current,
    }),
    {
      stepsCount: STEPS.length,
      rowRem: MOBILE_ROW_REM,
      cardWRem: MOBILE_CARD_W_REM,
      nameStepRem: MOBILE_NAME_STEP_REM,
      nameStopRem: MOBILE_NAME_STOP_REM,
      nameWaitBaseRem: MOBILE_NAME_WAIT_BASE_REM,
      titleExitRem: MOBILE_TITLE_EXIT_REM,
      titleGapRem: MOBILE_TITLE_GAP_REM,
      hasDescription: false,
      endPercent: 780,
    },
  )

  return (
    <>
      <section className="Steps hidden bg-ink lg:block">
        <div ref={introWrapperRef} className="Steps-intro relative h-screen">
          <div className="sticky top-0 h-screen overflow-hidden">
            <div
              ref={titleWrapRef}
              className="Steps-title-wrap absolute top-1/2 left-1/2 z-10 flex h-[13.125rem] w-[103.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-between leading-none tracking-[0em] text-white"
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
                  extraCompressIndices={[1]}
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
                    <div className="steps-card-img relative h-[21.5625rem] w-[38.375rem] shrink-0 overflow-hidden">
                      <div
                        ref={(el) => {
                          imgWrapRefs.current[i] = el
                        }}
                        className="absolute top-0 left-1/2 h-full w-0 -translate-x-1/2 overflow-hidden"
                      >
                        <img
                          src={step.image}
                          alt={`Проект «${step.name}», ${step.year}`}
                          className={`absolute top-0 left-1/2 h-full w-[38.375rem] max-w-none -translate-x-1/2 object-cover ${step.imageClassName ?? ''}`}
                        />
                      </div>
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

      <section className="Steps-tablet hidden bg-ink md:block lg:hidden">
        <div ref={introWrapperRefT} className="Steps-intro relative h-screen">
          <div className="sticky top-0 h-screen overflow-hidden">
            <div
              ref={titleWrapRefT}
              className="Steps-title-wrap absolute top-1/2 left-1/2 z-10 flex h-4 w-[45.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-between leading-none tracking-[-0.15rem] text-white"
            >
              <p ref={titleLeftRefT} className="Steps-title-left text-[3rem]">
                <LetterMask
                  text="Steps"
                  animated
                  mask={false}
                  registerRef={(el, i) => {
                    titleLetterRefsT.current[i] = el
                  }}
                />
              </p>
              <p ref={titleRightRefT} className="Steps-title-right text-[3rem]">
                <LetterMask
                  text="Taken"
                  animated
                  mask={false}
                  registerRef={(el, i) => {
                    titleLetterRefsT.current[5 + i] = el
                  }}
                />
              </p>
            </div>

            <div
              ref={nameListWrapRefT}
              className="Steps-card-name-list absolute top-5 left-5 h-[61.5rem] w-[10.25rem]"
            >
              {STEPS.map((step, i) => (
                <p
                  key={step.name}
                  ref={(el) => {
                    nameRefsT.current[i] = el
                  }}
                  className="Steps-card-name absolute left-0 text-[1.5rem] leading-none text-white"
                >
                  {step.name}
                </p>
              ))}
            </div>

            <div className="Steps-cards absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div
                ref={cardsShiftRefT}
                className="Steps-cards-shift relative h-[12.5rem] w-[22.5rem]"
              >
                {STEPS.map((step, i) => (
                  <div
                    key={step.name}
                    ref={(el) => {
                      cardRefsT.current[i] = el
                    }}
                    className="Steps-card absolute top-0 left-0 h-[12.5rem] w-[22.5rem] bg-ink"
                    style={{ zIndex: STEPS.length - i }}
                  >
                    <div className="steps-card-img relative size-full overflow-hidden">
                      <div
                        ref={(el) => {
                          imgWrapRefsT.current[i] = el
                        }}
                        className="absolute top-0 left-1/2 h-full w-0 -translate-x-1/2 overflow-hidden"
                      >
                        <img
                          src={step.image}
                          alt={`Проект «${step.name}», ${step.year}`}
                          className={`absolute top-0 left-1/2 h-full w-[22.5rem] max-w-none -translate-x-1/2 object-cover ${step.imageClassName ?? ''}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              ref={yearListWrapRefT}
              className="Steps-card-year-list absolute top-5 right-5 h-[61.5rem] w-[10.25rem] text-right"
            >
              {STEPS.map((step, i) => (
                <p
                  key={step.name}
                  ref={(el) => {
                    yearRefsT.current[i] = el
                  }}
                  className="Steps-card-year absolute right-0 text-[1.5rem] leading-none tracking-[-0.075rem] text-white"
                >
                  {step.year}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="Steps-mobile block bg-ink md:hidden">
        <div ref={introWrapperRefM} className="Steps-intro relative h-screen">
          <div className="sticky top-0 h-screen overflow-hidden">
            <div
              ref={titleWrapRefM}
              className="Steps-title-wrap absolute top-1/2 left-1/2 z-10 flex h-4 w-[40rem] -translate-x-1/2 -translate-y-1/2 items-center justify-between leading-none tracking-[-0.15rem] text-white"
            >
              <p ref={titleLeftRefM} className="Steps-title-left text-[3rem]">
                <LetterMask
                  text="Steps"
                  animated
                  mask={false}
                  registerRef={(el, i) => {
                    titleLetterRefsM.current[i] = el
                  }}
                />
              </p>
              <p ref={titleRightRefM} className="Steps-title-right text-[3rem]">
                <LetterMask
                  text="Taken"
                  animated
                  mask={false}
                  registerRef={(el, i) => {
                    titleLetterRefsM.current[5 + i] = el
                  }}
                />
              </p>
            </div>

            <div
              ref={nameListWrapRefM}
              className="Steps-card-name-list absolute top-4 left-4 h-[48.75rem] w-[6.5rem]"
            >
              {STEPS.map((step, i) => (
                <p
                  key={step.name}
                  ref={(el) => {
                    nameRefsM.current[i] = el
                  }}
                  className="Steps-card-name absolute left-0 text-[1.25rem] leading-none whitespace-nowrap text-white"
                >
                  {step.name}
                </p>
              ))}
            </div>

            <div className="Steps-cards absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div
                ref={cardsShiftRefM}
                className="Steps-cards-shift relative h-[8rem] w-[14.125rem]"
              >
                {STEPS.map((step, i) => (
                  <div
                    key={step.name}
                    ref={(el) => {
                      cardRefsM.current[i] = el
                    }}
                    className="Steps-card absolute top-0 left-0 h-[8rem] w-[14.125rem] bg-ink"
                    style={{ zIndex: STEPS.length - i }}
                  >
                    <div className="steps-card-img relative size-full overflow-hidden">
                      <div
                        ref={(el) => {
                          imgWrapRefsM.current[i] = el
                        }}
                        className="absolute top-0 left-1/2 h-full w-0 -translate-x-1/2 overflow-hidden"
                      >
                        <img
                          src={step.image}
                          alt={`Проект «${step.name}», ${step.year}`}
                          className={`absolute top-0 left-1/2 h-full w-[14.125rem] max-w-none -translate-x-1/2 object-cover ${step.imageClassName ?? ''}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              ref={yearListWrapRefM}
              className="Steps-card-year-list absolute top-4 right-4 h-[48.75rem] w-[6.5rem] text-right"
            >
              {STEPS.map((step, i) => (
                <p
                  key={step.name}
                  ref={(el) => {
                    yearRefsM.current[i] = el
                  }}
                  className="Steps-card-year absolute right-0 text-[1.25rem] leading-none whitespace-nowrap tracking-[-0.0625rem] text-white"
                >
                  {step.year}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Steps
