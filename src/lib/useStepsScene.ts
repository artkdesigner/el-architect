import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/*
  Общая пин-сцена секции Steps — одна архитектура для desktop/tablet/mobile,
  отличаются только размеры/отступы (передаются через StepsSceneConfig) и
  DOM-узлы конкретной раскладки (StepsSceneRefs). Порядок шагов:
   A. буквы title-wrap проявляются (fade+rise, без маски);
   B. title-left/-right расходятся к краям контейнера (из сведённого к
      центру состояния) + все steps-card-img раскрываются из центра
      симметрично в обе стороны (растим width, центрирование — чистым CSS,
      left-1/2 + -translate-x-1/2 на растущем окне);
   C. карточки 1..N-1 разъезжаются на rowRem каждая (карточка 0 остаётся на
      месте); title-wrap уезжает вверх (в 2 раза дольше, чтобы не было
      рывка) и гаснет до 20%; после того как карточки разъехались —
      проявляются списки имён/годов и описание (если есть) первой карточки;
      затем имя/год первой карточки оседают на финальную позицию; первая
      карточка держится активной ещё немного (+25vh) перед началом цикла;
   D. цикл на каждую следующую карточку: предыдущая уезжает вверх на rowRem
      (общим сдвигом ленты), гаснет её img/description/имя/год; новая
      становится активной, её имя/год приезжают в свою ячейку накопленного
      стека.
*/

export interface StepsSceneRefs {
  wrapperEl: HTMLElement | null
  titleWrap: HTMLElement | null
  titleLeft: HTMLElement | null
  titleRight: HTMLElement | null
  letters: (HTMLElement | null)[]
  cardsShift: HTMLElement | null
  cards: (HTMLElement | null)[]
  imgWraps: (HTMLElement | null)[]
  descs: (HTMLElement | null)[]
  nameListWrap: HTMLElement | null
  yearListWrap: HTMLElement | null
  names: (HTMLElement | null)[]
  years: (HTMLElement | null)[]
}

export interface StepsSceneConfig {
  stepsCount: number
  rowRem: number // высота карточки + гап — шаг наезда/смещения карточек
  cardWRem: number // финальная ширина steps-card-img
  nameStepRem: number // шаг оседания имени/года в накопленном стеке
  nameStopRem: number // итоговая позиция остановки первого имени/года
  nameWaitBaseRem: number // стартовая («в очереди») позиция первого имени/года
  titleExitRem: number // насколько title-wrap уезжает вверх при выходе
  titleGapRem?: number // зазор между title-left/-right при сведении к центру (по умолчанию 1.25rem = gap-5)
  hasDescription: boolean
  endPercent?: number // длина скролла ScrollTrigger, по умолчанию 1087.5
}

export function useStepsScene(
  getRefs: () => StepsSceneRefs | null,
  config: StepsSceneConfig,
) {
  useLayoutEffect(() => {
    const refs = getRefs()
    if (!refs) return

    const {
      wrapperEl,
      titleWrap,
      titleLeft,
      titleRight,
      cardsShift,
      nameListWrap,
      yearListWrap,
    } = refs
    const letters = refs.letters.filter((el): el is HTMLElement => el !== null)
    const cards = refs.cards
    const imgWraps = refs.imgWraps
    const descs = refs.descs
    const names = refs.names
    const years = refs.years

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
      names.some((el) => el === null) ||
      years.some((el) => el === null) ||
      (config.hasDescription && descs.some((el) => el === null))
    ) {
      return
    }

    const {
      stepsCount,
      rowRem,
      cardWRem,
      nameStepRem,
      nameStopRem,
      nameWaitBaseRem,
      titleExitRem,
      titleGapRem = 1.25,
      hasDescription,
      endPercent = 1087.5,
    } = config
    const lastIndex = stepsCount - 1

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reduceMotion) {
      gsap.set(letters, { yPercent: 0, opacity: 1 })
      gsap.set(titleWrap, { opacity: 0.2 })
      gsap.set(imgWraps, { width: `${cardWRem}rem` })
      gsap.set(cards, { y: 0 })
      gsap.set(cardsShift, { y: `-${lastIndex * rowRem}rem` })
      imgWraps.forEach((el, i) =>
        gsap.set(el, { opacity: i === lastIndex ? 1 : 0.2 }),
      )
      if (hasDescription) {
        descs.forEach((el, i) =>
          gsap.set(el, { opacity: i === lastIndex ? 1 : 0 }),
        )
      }
      gsap.set(nameListWrap, { opacity: 1 })
      gsap.set(yearListWrap, { opacity: 1 })
      names.forEach((el, i) =>
        gsap.set(el, {
          top: `${nameStopRem + i * nameStepRem}rem`,
          opacity: i === lastIndex ? 1 : 0.2,
        }),
      )
      years.forEach((el, i) =>
        gsap.set(el, {
          top: `${nameStopRem + i * nameStepRem}rem`,
          opacity: i === lastIndex ? 1 : 0.2,
        }),
      )
      return
    }

    gsap.set(letters, { yPercent: 100, opacity: 0 })
    gsap.set(imgWraps, { width: 0 })
    gsap.set(imgWraps.slice(1), { opacity: 0.2 })
    if (hasDescription) gsap.set(descs, { opacity: 0 })
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
        top: (i) => `${nameWaitBaseRem + i * nameStepRem}rem`,
      })
      gsap.set(years, {
        top: (i) => `${nameWaitBaseRem + i * nameStepRem}rem`,
      })

      // Стартовое состояние title-left/-right: сведены к центру, раскладка
      // justify-between уже финальная.
      const gapPx = rootFontSize * titleGapRem
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
            end: `+=${endPercent}%`,
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
        // центра симметрично в обе стороны.
        tl.to([titleLeft, titleRight], {
          x: 0,
          duration: 1,
          ease: 'power2.inOut',
        })
        tl.to(
          imgWraps,
          { width: `${cardWRem}rem`, duration: 1, ease: 'power2.inOut' },
          '<',
        )

        // C. карточки 1..N-1 разъезжаются вниз; title уезжает вверх и гаснет.
        cards.forEach((card, i) => {
          if (i === 0) return
          tl.to(
            card,
            { y: px(i * rowRem), duration: 1, ease: 'power2.inOut' },
            i === 1 ? undefined : '<',
          )
        })
        tl.to(
          titleWrap,
          { y: px(titleExitRem), duration: 2, ease: 'power2.inOut' },
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
        if (hasDescription) {
          tl.to(
            descs[0],
            { opacity: 1, duration: 0.5, ease: 'power1.out' },
            '<',
          )
        }

        // и только затем имя/год первой карточки оседают на финальную позицию.
        tl.to(names[0], {
          top: `${nameStopRem}rem`,
          opacity: 1,
          duration: 0.5,
          ease: 'power1.out',
        })
        tl.to(
          years[0],
          {
            top: `${nameStopRem}rem`,
            opacity: 1,
            duration: 0.5,
            ease: 'power1.out',
          },
          '<',
        )

        // пауза: первая карточка остаётся активной ещё +25vh скролла, прежде
        // чем начнётся переход ко второй.
        tl.to({}, { duration: 0.2353 })

        // D. цикл по остальным карточкам: предыдущая уезжает и гаснет,
        // следующая занимает её место и активируется.
        for (let i = 1; i <= lastIndex; i++) {
          const prev = i - 1
          tl.to(cardsShift, {
            y: px(-i * rowRem),
            duration: 1,
            ease: 'power2.inOut',
          })
          tl.to(
            imgWraps[prev],
            { opacity: 0.2, duration: 1, ease: 'power2.inOut' },
            '<',
          )
          if (hasDescription) {
            tl.to(
              descs[prev],
              { opacity: 0, duration: 1, ease: 'power2.inOut' },
              '<',
            )
          }
          tl.to(names[prev], { opacity: 0.2, duration: 1 }, '<')
          tl.to(years[prev], { opacity: 0.2, duration: 1 }, '<')
          tl.to(
            imgWraps[i],
            { opacity: 1, duration: 1, ease: 'power2.inOut' },
            '<',
          )
          if (hasDescription) {
            tl.to(
              descs[i],
              { opacity: 1, duration: 1, ease: 'power2.inOut' },
              '<',
            )
          }
          tl.to(
            names[i],
            {
              top: `${nameStopRem + i * nameStepRem}rem`,
              opacity: 1,
              duration: 1,
              ease: 'power2.inOut',
            },
            '<',
          )
          tl.to(
            years[i],
            {
              top: `${nameStopRem + i * nameStepRem}rem`,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
