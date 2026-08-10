
import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * ⚠️ Le premier rendu client DOIT être identique au rendu serveur.
 *
 * L'implémentation précédente lisait `window.innerWidth` pendant le rendu quand
 * l'état valait encore `undefined` : le serveur renvoyait `false` (pas de
 * `window`), le premier rendu client renvoyait `true` sur tout téléphone. Les
 * composants qui branchent dessus rendaient donc un arbre différent de part et
 * d'autre — `PremiumTooltip` ajoute un `<div>` d'enrobage en mobile — ce qui
 * provoquait « Hydration failed » sur /simulateur et faisait re-rendre tout
 * l'îlot côté client.
 *
 * On part donc TOUJOURS de `false`, et la vraie valeur arrive après montage.
 * Conséquence assumée : une frame en variante desktop avant bascule, invisible
 * ici puisque seul l'enrobage change, pas le contenu.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    // Fonction de vérification de la taille de l'écran
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Initialiser la valeur
    checkIsMobile()
    
    // Ajouter l'écouteur d'événement pour les changements de taille
    window.addEventListener("resize", checkIsMobile)
    
    // Nettoyage
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  return isMobile
}
