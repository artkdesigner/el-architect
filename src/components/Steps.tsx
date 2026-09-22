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

function Steps() {
  const titleWrapRef = useRef<HTMLDivElement>(null)
  const titleLetterRefs = useRef<(HTMLSpanElement | null)[]>([])

  // Steps-title-wrap: буквы поднимаются из-за нижнего края маски (yPercent
  // 100 -> 0) и одновременно проявляются по opacity, по мере скролла секции
  // в вьюпорт (scrub, не фиксированная длительность).
  useLayoutEffect(() => {
    const letters = titleLetterRefs.current.filter(
      (el): el is HTMLSpanElement => el !== null,
    )
    if (!titleWrapRef.current || letters.length === 0) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reduceMotion) {
      gsap.set(letters, { yPercent: 0, opacity: 1 })
      return
    }

    gsap.set(letters, { yPercent: 100, opacity: 0 })

    const ctx = gsap.context(() => {
      gsap.to(letters, {
        yPercent: 0,
        opacity: 1,
        stagger: 0.05,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: titleWrapRef.current,
          start: 'top 90%',
          end: 'top 40%',
          scrub: 0.5,
        },
      })
    }, titleWrapRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="Steps hidden bg-ink px-5 lg:flex lg:flex-col lg:items-center lg:justify-center">
      <div
        ref={titleWrapRef}
        className="Steps-title-wrap flex items-center justify-center gap-5 pb-[3.125rem] leading-none tracking-[-0.5rem] text-white"
      >
        <p className="text-[10rem]">
          <LetterMask
            text="Steps"
            animated
            registerRef={(el, i) => {
              titleLetterRefs.current[i] = el
            }}
          />
        </p>
        <p className="text-[10rem]">
          <LetterMask
            text="Taken"
            animated
            registerRef={(el, i) => {
              titleLetterRefs.current[5 + i] = el
            }}
          />
        </p>
      </div>

      <div className="Steps-card-list flex w-full flex-col gap-5">
        {STEPS.map((step) => (
          <div key={step.name} className="Steps-row flex items-center gap-5">
            <p className="Steps-card-name w-[38.3125rem] shrink-0 text-[2.25rem] leading-none text-white">
              {step.name}
            </p>
            <div className="Steps-card flex shrink-0 items-start gap-5">
              <div className="steps-card-img h-[21.5625rem] w-[38.375rem] shrink-0 overflow-hidden">
                <img
                  src={step.image}
                  alt={`Проект «${step.name}», ${step.year}`}
                  className={`size-full object-cover ${step.imageClassName ?? ''}`}
                  loading="lazy"
                />
              </div>
              <p className="Steps-card-description w-[18.5rem] shrink-0 indent-[2.25rem] text-[1rem] leading-[1.2] tracking-[-0.03rem] text-white">
                {step.description}
              </p>
            </div>
            <p className="Steps-card-year flex-1 text-right text-[2.5rem] leading-none tracking-[-0.125rem] text-white">
              {step.year}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Steps
