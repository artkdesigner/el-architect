import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/*
  Пин-сцена секции Evidence. Порядок шагов:
   A. буквы Evidence-title проявляются (fade+rise), как в Steps-title-wrap;
   B. Evidence-title целиком уменьшается и гаснет до 0 (scale и opacity);
   C. Evidence-cards-wrap начинает въезжать справа, когда заголовок прошёл
      20% своего уменьшения (не дожидаясь конца фазы B), и останавливается,
      когда первая карточка встаёт по центру экрана (в активном/большом
      размере, остальные — в маленьком); пока едет — opacity 20% → 100%, и
      одновременно Evidence-card-description первой карточки выезжает
      из-под картинки на свою позицию (см. ниже);
   D. дальше ряд едет ещё на шаг влево на каждую следующую карточку — прошлая
      активная карточка одновременно уменьшается до маленького размера и её
      описание прячется обратно под картинку, новая активная увеличивается
      до большого размера и её описание выезжает на позицию — пока не
      встанет последняя.

  Активная (стоящая в центре) карточка — большого размера (cardWRem×cardHRem)
  и 100% opacity, все остальные — маленького (smallCardWRem×smallCardHRem) и
  20% opacity. Шаг между «докнутыми» позициями поэтому НЕ равномерный:
  смещение до активной карточки k считается в предположении, что все k
  карточек перед ней — маленькие (см. dockedX ниже), а не через единый шаг
  cardW+gap.

  Evidence-card-description у неактивной карточки спрятан под её картинкой:
  сдвинут вправо от своей базовой CSS-позиции (left: -1.25rem) на 100%
  собственной ширины + 20px (xPercent: 100, x: gapPx) — так подпись целиком
  уходит под картинку, не выглядывая слева за её краем; opacity 0 —
  дополнительная подстраховка, картинка и так перекрывает её в DOM без
  z-index. У активной карточки — на своей позиции слева от картинки, opacity
  100% (xPercent: -100, x: 0 — как раньше давала статичная -translate-x-full).
  xPercent, а не x в px, чтобы не зависеть от ширины подписи.

  Единый scrub-таймлайн, все фазы — это последовательные твины одного GSAP
  timeline, никакого переключения состояний вручную.

  orientation: 'vertical' (планшет/мобильный) — та же сцена, повёрнутая на 90°:
  ряд — колонка, въезжает снизу и едет вверх (y вместо x, высоты вместо
  ширин, высота пина вместо ширины). Подпись у неактивной карточки лежит под
  картинкой у её верхнего края (top: 0), у активной — над картинкой на
  descGapRem выше (yPercent: -100, y: -descGap).
*/

export interface EvidenceSceneRefs {
  wrapperEl: HTMLElement | null
  titleEl: HTMLElement | null
  letters: (HTMLElement | null)[]
  cardsWrap: HTMLElement | null
  cards: (HTMLElement | null)[]
  descriptions: (HTMLElement | null)[]
  pinEl: HTMLElement | null
}

export interface EvidenceSceneConfig {
  cardsCount: number
  cardWRem: number // ширина активной карточки — совпадает с шириной Evidence-card-img
  cardHRem: number // высота активной карточки
  smallCardWRem: number // ширина неактивной (ждущей) карточки
  smallCardHRem: number // высота неактивной (ждущей) карточки
  gapRem: number // зазор между карточками
  endPercent?: number // длина скролла ScrollTrigger
  orientation?: 'horizontal' | 'vertical'
  descGapRem?: number // vertical: зазор между подписью и верхом картинки
}

export function useEvidenceScene(
  getRefs: () => EvidenceSceneRefs | null,
  config: EvidenceSceneConfig,
) {
  useLayoutEffect(() => {
    const refs = getRefs()
    if (!refs) return

    const { wrapperEl, titleEl, cardsWrap, pinEl } = refs
    const letters = refs.letters.filter((el): el is HTMLElement => el !== null)
    const cards = refs.cards
    const descriptions = refs.descriptions

    if (
      !wrapperEl ||
      !titleEl ||
      !cardsWrap ||
      !pinEl ||
      letters.length === 0 ||
      cards.some((el) => el === null) ||
      descriptions.some((el) => el === null)
    ) {
      return
    }

    const {
      cardsCount,
      cardWRem,
      cardHRem,
      smallCardWRem,
      smallCardHRem,
      gapRem,
      endPercent = 850,
      orientation = 'horizontal',
      descGapRem = 0,
    } = config
    const lastIndex = cardsCount - 1
    const vertical = orientation === 'vertical'

    const rootFontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    )
    const px = (rem: number) => rem * rootFontSize

    const cardWPx = px(cardWRem)
    const cardHPx = px(cardHRem)
    const smallWPx = px(smallCardWRem)
    const smallHPx = px(smallCardHRem)
    const gapPx = px(gapRem)
    const descGapPx = px(descGapRem)
    const pinRect = pinEl.getBoundingClientRect()
    // Смещение до активной карточки k — все k карточек перед ней маленькие.
    // Горизонтально ряд стоит от left: 0, вертикально — от top: 50%.
    const dockedOffset = (k: number) =>
      vertical
        ? -(k * (smallHPx + gapPx) + cardHPx / 2)
        : pinRect.width / 2 - (k * (smallWPx + gapPx) + cardWPx / 2)
    const startOffset = vertical ? pinRect.height / 2 : pinRect.width
    const wrapAt = (offset: number) =>
      vertical ? { y: offset } : { x: offset }
    const wrapBase = vertical ? {} : { y: '-50%' }

    const descHidden = vertical
      ? { yPercent: 0, y: 0, opacity: 0 }
      : { xPercent: 100, x: gapPx, opacity: 0 }
    const descShown = vertical
      ? { yPercent: -100, y: -descGapPx, opacity: 1 }
      : { xPercent: -100, x: 0, opacity: 1 }

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reduceMotion) {
      gsap.set(letters, { yPercent: 0, opacity: 1 })
      gsap.set(titleEl, { scale: 0, opacity: 0 })
      gsap.set(cardsWrap, {
        ...wrapBase,
        ...wrapAt(dockedOffset(lastIndex)),
        opacity: 1,
      })
      gsap.set(descriptions.slice(0, lastIndex), descHidden)
      gsap.set(descriptions[lastIndex], descShown)
      gsap.set(cards.slice(0, lastIndex), {
        width: smallWPx,
        height: smallHPx,
        opacity: 0.2,
      })
      gsap.set(cards[lastIndex], {
        width: cardWPx,
        height: cardHPx,
        opacity: 1,
      })
      return
    }

    gsap.set(letters, { yPercent: 100, opacity: 0 })
    gsap.set(titleEl, { scale: 1, opacity: 1 })
    gsap.set(cardsWrap, {
      ...wrapBase,
      ...wrapAt(startOffset),
      opacity: 0.2,
    })
    gsap.set(descriptions, descHidden)
    gsap.set(cards[0], { width: cardWPx, height: cardHPx, opacity: 1 })
    gsap.set(cards.slice(1), {
      width: smallWPx,
      height: smallHPx,
      opacity: 0.2,
    })

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperEl,
          start: 'top top',
          end: `+=${endPercent}%`,
          scrub: 0.5,
          pin: true,
        },
      })

      // A. буквы заголовка
      tl.to(letters, {
        yPercent: 0,
        opacity: 1,
        stagger: 0.05,
        ease: 'power2.out',
        duration: 1,
      })

      // B. заголовок целиком уменьшается и гаснет до нуля
      tl.addLabel('titleShrinkStart')
      const titleShrinkDuration = 1
      tl.to(titleEl, {
        scale: 0,
        opacity: 0,
        duration: titleShrinkDuration,
        ease: 'power2.inOut',
      })

      // C. ряд карточек въезжает справа и встаёт по центру первой карточкой —
      // стартует, когда заголовок прошёл 20% своего уменьшения (не дожидаясь
      // конца фазы B). Подпись первой карточки выезжает из-под картинки на
      // позицию одновременно с этим въездом.
      const cardsInStart =
        tl.labels.titleShrinkStart + titleShrinkDuration * 0.2
      tl.to(
        cardsWrap,
        {
          ...wrapAt(dockedOffset(0)),
          opacity: 1,
          duration: 1.2,
          ease: 'power2.inOut',
        },
        cardsInStart,
      )
      tl.to(
        descriptions[0],
        { ...descShown, duration: 1.2, ease: 'power2.inOut' },
        cardsInStart,
      )

      // D. цикл: следующая карточка занимает центр, увеличивается до
      // большого размера и её описание выезжает на позицию; прошлая уезжает
      // влево, уменьшается до маленького размера, и её описание прячется
      // обратно под картинку.
      for (let i = 1; i <= lastIndex; i++) {
        tl.to(cardsWrap, {
          ...wrapAt(dockedOffset(i)),
          duration: 1,
          ease: 'power2.inOut',
        })
        tl.to(
          cards[i - 1],
          {
            width: smallWPx,
            height: smallHPx,
            opacity: 0.2,
            duration: 1,
            ease: 'power2.inOut',
          },
          '<',
        )
        tl.to(
          cards[i],
          {
            width: cardWPx,
            height: cardHPx,
            opacity: 1,
            duration: 1,
            ease: 'power2.inOut',
          },
          '<',
        )
        tl.to(
          descriptions[i - 1],
          { ...descHidden, duration: 1, ease: 'power2.inOut' },
          '<',
        )
        tl.to(
          descriptions[i],
          { ...descShown, duration: 1, ease: 'power2.inOut' },
          '<',
        )
      }
    }, wrapperEl)

    return () => {
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
