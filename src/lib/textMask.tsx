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
  // Оборачивать ли каждую букву в overflow-hidden маску (эффект «выезда
  // снизу из-под маски»). false — буква анимируется видимой (без клиппинга),
  // например для появления через opacity + y без маскирования.
  mask?: boolean
  // margin-left: -0.5rem на все буквы кроме первой — ручная компенсация
  // межбуквенного расстояния, когда letter-spacing на обёртке выключен (0).
  compress?: boolean
}

export function LetterMask({
  text,
  animated,
  registerRef,
  mask = true,
  compress = false,
}: LetterMaskProps) {
  return (
    <>
      {text.split('').map((char, index) => {
        const letter = (
          <span
            ref={animated ? (el) => registerRef?.(el, index) : undefined}
            className="inline-block"
          >
            {char === ' ' ? ' ' : char}
          </span>
        )
        const outerClassName = [
          'inline-block',
          mask && 'overflow-hidden',
          compress && index > 0 && '-ml-[0.5rem]',
        ]
          .filter(Boolean)
          .join(' ')
        return (
          <span key={index} className={outerClassName}>
            {letter}
          </span>
        )
      })}
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
