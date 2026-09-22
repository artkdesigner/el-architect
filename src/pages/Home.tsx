import { useRef } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import How from '../components/How'
import Steps from '../components/Steps'

function Home() {
  const logoMaskRef = useRef<HTMLDivElement | null>(null)
  const ctaMaskRef = useRef<HTMLDivElement | null>(null)
  const burgerLine1Ref = useRef<HTMLSpanElement | null>(null)
  const burgerLine2Ref = useRef<HTMLSpanElement | null>(null)
  const howSectionRef = useRef<HTMLElement | null>(null)

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
      </main>
    </>
  )
}

export default Home
