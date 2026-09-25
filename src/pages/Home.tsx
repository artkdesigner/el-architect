import { useLayoutEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import How from '../components/How'
import Steps from '../components/Steps'
import Evidence from '../components/Evidence'

function Home() {
  const logoMaskRef = useRef<HTMLDivElement | null>(null)
  const ctaMaskRef = useRef<HTMLDivElement | null>(null)
  const burgerLine1Ref = useRef<HTMLSpanElement | null>(null)
  const burgerLine2Ref = useRef<HTMLSpanElement | null>(null)
  const howSectionRef = useRef<HTMLElement | null>(null)

  // Секции создают свои ScrollTrigger-пины в дочерних useLayoutEffect (Steps,
  // Evidence). Родительский useLayoutEffect коммитится последним, когда вся
  // разметка уже осела — но порядок создания триггеров (Steps трижды, потом
  // Evidence) не совпадает с порядком, в котором GSAP их регистрирует
  // внутренне: без sort() ScrollTrigger.refresh() пересчитывает Evidence
  // раньше Steps-desktop и берёт его ещё не развёрнутый (compact) размер —
  // диапазон Evidence наезжает на диапазон Steps. sort() выстраивает триггеры
  // по актуальной позиции в документе перед пересчётом.
  useLayoutEffect(() => {
    // sort() один раз не держится: font-swap/lazy-контент триггерят
    // собственный автоматический refresh() у ScrollTrigger (resize/load), а
    // он пересчитывает триггеры в исходном порядке создания и откатывает
    // фикс. refreshInit гарантирует sort() перед КАЖДЫМ refresh, не только
    // первым.
    const onRefreshInit = () => ScrollTrigger.sort()
    ScrollTrigger.addEventListener('refreshInit', onRefreshInit)
    ScrollTrigger.refresh()
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', onRefreshInit)
    }
  }, [])

  return (
    <>
      <Navbar
        logoMaskRef={logoMaskRef}
        ctaMaskRef={ctaMaskRef}
        burgerLineRefs={[burgerLine1Ref, burgerLine2Ref]}
      />
      <main>
        <Hero
          navbarMaskRefs={[logoMaskRef, ctaMaskRef]}
          navbarBurgerLineRefs={[burgerLine1Ref, burgerLine2Ref]}
          howSectionRef={howSectionRef}
        />
        <How sectionRef={howSectionRef} />
        <Steps />
        <Evidence />
      </main>
    </>
  )
}

export default Home
