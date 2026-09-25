import { useRef } from 'react'
import { LetterMask } from '../lib/textMask'
import { useEvidenceScene } from '../lib/useEvidenceScene'
import evidenceCard1 from '../assets/evidence/evidence-card-1.webp'
import evidenceCard2 from '../assets/evidence/evidence-card-2.webp'
import evidenceCard3 from '../assets/evidence/evidence-card-3.webp'
import evidenceCard4 from '../assets/evidence/evidence-card-4.webp'
import evidenceCard5 from '../assets/evidence/evidence-card-5.webp'
import evidenceCard6 from '../assets/evidence/evidence-card-6.webp'

interface EvidenceProject {
  name: string
  architect: string
  location: string
  year: string
  image: string
  captionPosition: 'top' | 'bottom'
  align: 'top' | 'bottom'
}

const PROJECTS: EvidenceProject[] = [
  {
    name: 'Multifunctional Residential Complex',
    architect: 'Eran Mebel Architects',
    location: 'Tiberius, Israel',
    year: '2025',
    image: evidenceCard1,
    captionPosition: 'top',
    align: 'top',
  },
  {
    name: 'Multifunctional Residential Complex',
    architect: 'Eran Mebel Architects',
    location: 'Haifa, Israel',
    year: '2025',
    image: evidenceCard2,
    captionPosition: 'bottom',
    align: 'bottom',
  },
  {
    name: 'Research Center',
    architect: 'Eran Mebel Architects',
    location: 'Mate Asher settlement, Israel',
    year: '2024',
    image: evidenceCard3,
    captionPosition: 'top',
    align: 'bottom',
  },
  {
    name: 'Multifunctional Residential Complex',
    architect: 'Eran Mebel Architects',
    location: 'Tiberius, Israel',
    year: '2024',
    image: evidenceCard4,
    captionPosition: 'top',
    align: 'top',
  },
  {
    name: 'Multifunctional Residential Complex',
    architect: 'Eran Mebel Architects',
    location: 'Hadera, Israel',
    year: '2024',
    image: evidenceCard5,
    captionPosition: 'bottom',
    align: 'bottom',
  },
  {
    name: 'Multifunctional Residential Complex',
    architect: 'Eran Mebel Architects',
    location: 'Hadera, Israel',
    year: '2024',
    image: evidenceCard6,
    captionPosition: 'top',
    align: 'top',
  },
]

// Константы макета (px в референсной ширине 1920) переводятся в rem при
// использовании в className, и в px через текущий rootFontSize в
// useEvidenceScene — та же архитектура, что у Steps (см. useStepsScene).
const CARD_W_REM = 77.8125 // 1245px — ширина активной Evidence-card
const CARD_H_REM = 43.75 // 700px — высота активной Evidence-card
const SMALL_CARD_W_REM = 26.875 // 430px — ширина неактивной (ждущей) карточки
const SMALL_CARD_H_REM = 15.125 // 242px — высота неактивной (ждущей) карточки
const GAP_REM = 1.25 // 20px — зазор между карточками

function Evidence() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const letterRefs = useRef<(HTMLElement | null)[]>([])
  const cardsWrapRef = useRef<HTMLUListElement>(null)
  const cardRefs = useRef<(HTMLLIElement | null)[]>([])
  const descriptionRefs = useRef<(HTMLParagraphElement | null)[]>([])

  useEvidenceScene(
    () => ({
      wrapperEl: wrapperRef.current,
      titleEl: titleRef.current,
      letters: letterRefs.current,
      cardsWrap: cardsWrapRef.current,
      cards: cardRefs.current,
      descriptions: descriptionRefs.current,
      pinEl: pinRef.current,
    }),
    {
      cardsCount: PROJECTS.length,
      cardWRem: CARD_W_REM,
      cardHRem: CARD_H_REM,
      smallCardWRem: SMALL_CARD_W_REM,
      smallCardHRem: SMALL_CARD_H_REM,
      gapRem: GAP_REM,
    },
  )

  return (
    <section
      className="Evidence -mt-[50vh] hidden bg-ink lg:block"
      aria-label="The Evidence — selected projects"
    >
      <div ref={wrapperRef} className="Evidence-intro relative h-screen">
        <div
          ref={pinRef}
          className="Evidence-pin sticky top-0 h-screen overflow-clip"
        >
          <div className="Evidence-title-wrap pointer-events-none absolute top-1/2 left-1/2 z-10 w-[103.5rem] -translate-x-1/2 -translate-y-1/2 text-center">
            <h2
              ref={titleRef}
              className="Evidence-title text-[7.5rem] leading-none tracking-[-0.375rem] whitespace-nowrap text-white"
            >
              <LetterMask
                text="The Evidence"
                animated
                mask={false}
                registerRef={(el, i) => {
                  letterRefs.current[i] = el
                }}
              />
            </h2>
          </div>

          <ul
            ref={cardsWrapRef}
            className="Evidence-cards-wrap absolute top-1/2 left-0 flex h-[43.75rem] list-none gap-5"
          >
            {PROJECTS.map((project, i) => (
              <li
                key={`${project.name}-${project.location}-${project.year}-${i}`}
                ref={(el) => {
                  cardRefs.current[i] = el
                }}
                className={`Evidence-card relative shrink-0 ${
                  project.align === 'top' ? 'self-start' : 'self-end'
                }`}
              >
                <p
                  ref={(el) => {
                    descriptionRefs.current[i] = el
                  }}
                  className={`Evidence-card-description absolute left-[-1.25rem] w-[18.5625rem] text-right text-[1.25rem] leading-none tracking-[-0.0625rem] text-white ${
                    project.captionPosition === 'top'
                      ? 'top-0'
                      : 'bottom-15 translate-y-full'
                  }`}
                >
                  {project.name}
                  <br />
                  {project.architect}
                  <br />
                  {project.location}, {project.year}
                </p>
                <div className="Evidence-card-img relative size-full overflow-hidden">
                  <img
                    src={project.image}
                    alt={`${project.name}, ${project.location}, ${project.year}`}
                    className="block size-full object-cover"
                    loading="lazy"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Evidence
