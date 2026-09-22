/*
  Маски для построчного/побуквенного reveal-текста: каждый символ/строка
  обёрнуты в overflow-hidden спан (маска) + внутренний inline-block спан,
  который двигает GSAP (yPercent/opacity). См. раздел «Разбитый по буквам/
  строкам текст» в .claude/skills/figma-to-code/SKILL.md.
*/

interface LetterMaskProps {
  text: string
  animated: boolean
  registerRef?: (el: HTMLSpanElement | null, index: number) => void
}

export function LetterMask({ text, animated, registerRef }: LetterMaskProps) {
  return (
    <>
      {text.split('').map((char, index) => (
        <span key={index} className="inline-block overflow-hidden">
          <span
            ref={animated ? (el) => registerRef?.(el, index) : undefined}
            className="inline-block"
          >
            {char === ' ' ? ' ' : char}
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

export function LineMask({ lines, animated, registerRef }: LineMaskProps) {
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
