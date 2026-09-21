import { useLayoutEffect, useRef } from 'react'

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
  const wrapperRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])

  useLayoutEffect(() => {
    let frame = 0
    const words = wordRefs.current
    const wordCount = words.length

    const update = () => {
      const wrapper = wrapperRef.current
      if (!wrapper || wordCount === 0) return

      const viewportHeight = window.innerHeight
      const scrollRoomPx = 2 * viewportHeight // 200vh
      const triggerShift = 0.2 * viewportHeight // старт при видимости секции на 80%
      const rect = wrapper.getBoundingClientRect()
      const scrolledPx = Math.min(
        Math.max(triggerShift - rect.top, 0),
        scrollRoomPx,
      )
      const progress = scrolledPx / scrollRoomPx

      words.forEach((el, index) => {
        if (!el) return
        const wordProgress = Math.min(
          Math.max(progress * wordCount - index, 0),
          1,
        )
        el.style.transform = `translateX(${(1 - wordProgress) * 100}vw)`
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

  let wordIndex = 0

  return (
    <div ref={wrapperRef} className="How-wrapper relative h-[300vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-ink">
        <section className="How flex h-full items-start px-4 pt-58 md:px-5 md:pt-78">
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
                    style={{ transform: 'translateX(100vw)' }}
                  >
                    {token.word}
                  </span>{' '}
                </span>
              )
            })}
          </p>
        </section>
      </div>
    </div>
  )
}

export default How
