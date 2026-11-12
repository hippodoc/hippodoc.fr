"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

/**
 * Bulle d'aide des trois outils (simulateur par `PremiumTooltip`, calculette, boussole).
 *
 * À la souris et au clavier, rien d'autre que Radix : la bulle s'ouvre au survol et au
 * focus, se ferme quand on s'en va, au clic ou à Échap.
 *
 * Au doigt, Radix seul ne la montre pas : il écarte les pointeurs tactiles, l'ouvre au
 * focus que l'appui donne au bouton, puis la referme au clic du même appui (et Safari ne
 * donne pas ce focus). Ici, un appui l'ouvre et la retient (« épinglée ») : elle ne suit
 * plus les fermetures de Radix (défilement, perte du survol, autre bulle), et se ferme à
 * un second appui, à un appui ailleurs (un défilement au doigt n'en est pas un), à Échap,
 * ou quand le focus part vers un autre contrôle. Est tactile : un appui dont le pointeur
 * est un doigt ou un stylet, ou tout clic quand le pointeur principal ne survole pas
 * (`(hover: none)` ou `(pointer: coarse)`, lu après le montage, jamais au rendu : le HTML
 * du build et la première passe du navigateur sont les mêmes).
 *
 * Accessibilité : le déclencheur est un bouton nommé. Un déclencheur qui n'en est pas un
 * (`asChild` sur un `<span>`) reçoit après le montage `role="button"`, `tabindex="0"` et
 * l'activation par Entrée et Espace. Sur un appareil tactile, il porte `aria-expanded` ;
 * une bulle épinglée est aussi lue par une zone `role="status"` (une seule par page,
 * ajoutée à `<body>` après le montage). Le focus reste sur le déclencheur, rien n'est piégé.
 */

const TooltipProvider = TooltipPrimitive.Provider

const SANS_SURVOL = "(hover: none), (pointer: coarse)"
const abonner = (prevenir: () => void) => {
  const mq = window.matchMedia(SANS_SURVOL)
  mq.addEventListener("change", prevenir)
  return () => mq.removeEventListener("change", prevenir)
}
const lireSansSurvol = () => window.matchMedia(SANS_SURVOL).matches
const jamais = () => false

type Aide = {
  ouverte: boolean
  sansSurvol: boolean
  epinglee: React.MutableRefObject<boolean>
  declencheur: React.MutableRefObject<HTMLElement | null>
  contenu: React.MutableRefObject<HTMLElement | null>
  basculer: () => void
}
const AideContexte = React.createContext<Aide | null>(null)

/** Zone lue par les lecteurs d'écran quand une bulle est épinglée : une par page, posée avant d'être remplie. */
function zoneAnnonce() {
  let zone = document.getElementById("aide-annonce")
  if (!zone) {
    zone = document.createElement("div")
    zone.id = "aide-annonce"
    zone.setAttribute("role", "status")
    zone.style.cssText = "position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0"
    document.body.appendChild(zone)
  }
  return zone
}
function annoncer(texte: string) {
  const zone = zoneAnnonce()
  if (zone.textContent !== texte) zone.textContent = texte
}
/** Le texte lu est celui de l'élément `role="tooltip"` : la bulle elle-même, ou sa copie masquée quand elle porte un `aria-label`. */
function annoncerBulle(el: HTMLElement) {
  const lu = el.matches('[role="tooltip"]') ? el : el.querySelector<HTMLElement>('[role="tooltip"]')
  annoncer(lu?.innerText || lu?.textContent || "")
}

function poser<T>(ref: React.Ref<T> | undefined, valeur: T | null) {
  if (typeof ref === "function") ref(valeur)
  else if (ref) (ref as React.MutableRefObject<T | null>).current = valeur
}

const Tooltip = ({ open, defaultOpen = false, onOpenChange, children, ...props }: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>) => {
  const [interne, setInterne] = React.useState(defaultOpen)
  const ouverte = open ?? interne
  const [epingle, setEpingle] = React.useState(false)
  const epinglee = React.useRef(false)
  const declencheur = React.useRef<HTMLElement | null>(null)
  const contenu = React.useRef<HTMLElement | null>(null)
  const sansSurvol = React.useSyncExternalStore(abonner, lireSansSurvol, jamais)

  const changer = React.useCallback((o: boolean) => { setInterne(o); onOpenChange?.(o) }, [onOpenChange])
  const epingler = React.useCallback((o: boolean) => { epinglee.current = o; setEpingle(o); changer(o) }, [changer])
  const basculer = React.useCallback(() => epingler(!epinglee.current), [epingler])

  // Épinglée : fermée par un appui ailleurs ou par Échap, et par rien d'autre.
  React.useEffect(() => {
    if (!epingle) return
    const dedans = (c: EventTarget | null) => c instanceof Node && (!!declencheur.current?.contains(c) || !!contenu.current?.contains(c))
    let dehors = false
    const bas = (e: PointerEvent) => { dehors = !dedans(e.target) }
    const haut = (e: PointerEvent) => { if (dehors && !dedans(e.target)) epingler(false); dehors = false }
    const annule = () => { dehors = false }
    const touche = (e: KeyboardEvent) => { if (e.key === "Escape") epingler(false) }
    document.addEventListener("pointerdown", bas, true)
    document.addEventListener("pointerup", haut, true)
    document.addEventListener("pointercancel", annule, true)
    document.addEventListener("keydown", touche, true)
    return () => {
      document.removeEventListener("pointerdown", bas, true)
      document.removeEventListener("pointerup", haut, true)
      document.removeEventListener("pointercancel", annule, true)
      document.removeEventListener("keydown", touche, true)
    }
  }, [epingle, epingler])

  // La zone d'annonce existe dès qu'un appareil tactile est reconnu ; elle se vide quand la bulle se ferme.
  // Elle est remplie ici si la bulle est déjà dans la page (au doigt, Radix l'ouvre au focus, juste avant le clic),
  // sinon par TooltipContent quand Radix la monte, un rendu plus tard.
  React.useEffect(() => { if (sansSurvol) zoneAnnonce() }, [sansSurvol])
  React.useEffect(() => {
    if (!epingle) return
    if (contenu.current) annoncerBulle(contenu.current)
    return () => annoncer("")
  }, [epingle])

  const aide = React.useMemo(() => ({ ouverte, sansSurvol, epinglee, declencheur, contenu, basculer }), [ouverte, sansSurvol, basculer])

  return (
    <TooltipPrimitive.Root {...props} open={ouverte} onOpenChange={(o) => { if (!epinglee.current) changer(o) }}>
      <AideContexte.Provider value={aide}>{children}</AideContexte.Provider>
    </TooltipPrimitive.Root>
  )
}

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ onPointerDown, onClick, onKeyDown, onBlur, ...props }, ref) => {
  const aide = React.useContext(AideContexte)
  const pointeur = React.useRef("")
  const [faitBouton, setFaitBouton] = React.useState(false)
  const noeud = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    const el = noeud.current
    if (el && !el.matches("button, a[href], input, select, textarea, summary, [tabindex]")) setFaitBouton(true)
  }, [])

  if (!aide) return <TooltipPrimitive.Trigger ref={ref} onPointerDown={onPointerDown} onClick={onClick} onKeyDown={onKeyDown} onBlur={onBlur} {...props} />

  return (
    <TooltipPrimitive.Trigger
      {...(faitBouton ? { role: "button", tabIndex: 0 } : null)}
      aria-expanded={aide.sansSurvol ? aide.ouverte : undefined}
      {...props}
      ref={(el: HTMLButtonElement | null) => { noeud.current = el; aide.declencheur.current = el; poser(ref, el) }}
      onPointerDown={(e) => { pointeur.current = e.pointerType; onPointerDown?.(e) }}
      onClick={(e) => {
        onClick?.(e)
        const doigt = pointeur.current === "touch" || pointeur.current === "pen"
        pointeur.current = ""
        if (doigt || aide.sansSurvol) aide.basculer()
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        if (faitBouton && e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); e.currentTarget.click() }
      }}
      onBlur={(e) => {
        onBlur?.(e)
        // Le focus part vers un autre contrôle (Tab, appui sur un champ) : la bulle épinglée se ferme.
        // Un appui dans la bulle, ou dans le vide, ne la ferme pas ici.
        const vers = e.relatedTarget as Node | null
        if (aide.epinglee.current && vers && !aide.contenu.current?.contains(vers)) aide.basculer()
      }}
    />
  )
})
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  const aide = React.useContext(AideContexte)
  const poserContenu = React.useCallback((el: HTMLDivElement | null) => {
    if (aide) aide.contenu.current = el
    poser(ref, el)
    if (el && aide?.epinglee.current) annoncerBulle(el)
  }, [aide, ref])
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={poserContenu}
        sideOffset={sideOffset}
        avoidCollisions={true}
        collisionPadding={{ top: 8, bottom: 80, left: 8, right: 80 }}
        className={cn(
          "z-[100000] overflow-hidden rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
})
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
