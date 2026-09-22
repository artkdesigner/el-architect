import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LINES = [
  "My method is not a style. It's a principle of response.",
  'First — listening: context, history, hidden potential.',
  'Then — thinking: analysis, synthesis of experience,',
  'finding connections. Only then — form, born from this',
  'dialogue, not imposed from outside.',
]

const WORDS = LINES.flatMap((line, lineIndex) => {
  const words = line.split(' ').map((word) => ({ type: 'word' as const, word }))
  return lineIndex < LINES.length - 1
    ? [...words, { type: 'break' as const }]
    : words
})

function How() {
  const sectionRef = useRef<HTMLElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])

  useLayoutEffect(() => {
    const words = wordRefs.current.filter(
      (el): el is HTMLSpanElement => el !== null,
    )
    if (!sectionRef.current || words.length === 0) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reduceMotion) {
      gsap.set(words, { x: 0 })
      return
    }

    gsap.set(words, { x: '100vw' })

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top', // пин ровно у верха вьюпорта, без зазора
            end: '+=400%', // 400vh на анимацию
            scrub: 0.5,
            pin: true,
          },
        })
        .to(words, {
          x: 0,
          stagger: 0.7,
          duration: 13,
          ease: 'power2.out',
        })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  let wordIndex = 0

  return (
    <section
      ref={sectionRef}
      className="How flex h-screen items-start bg-ink px-4 pt-58 md:px-5 md:pt-78"
    >
      <p className="How-paragraph text-[2rem] leading-[1.18] tracking-[-0.1rem] text-white md:text-[2.5rem] md:tracking-[-0.125rem]">
        {WORDS.map((token, i) => {
          if (token.type === 'break') {
            return <br key={i} className="hidden lg:inline" />
          }
          const index = wordIndex++
          return (
            <span key={i}>
              <span
                ref={(el) => {
                  wordRefs.current[index] = el
                }}
                className="inline-block"
              >
                {token.word}
              </span>{' '}
            </span>
          )
        })}
      </p>
    </section>
  )
}

export default How
