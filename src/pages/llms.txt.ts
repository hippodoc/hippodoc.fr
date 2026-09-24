/**
 * /llms.txt — généré au build depuis la collection du blog (§ 9.bi).
 *
 * L'ancien fichier statique (public/llms.txt) ne citait AUCUN article : une seule
 * ligne « Blog », alors que robots.txt accueille explicitement les agents IA. Il
 * se périmait à chaque publication. L'en-tête et les sections Pages / Optional
 * sont repris mot pour mot ; les articles sont listés par série, avec le titre
 * et la description du frontmatter (aucun texte nouveau).
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_URL } from '@/lib/site';
import { blogSeries } from '@/lib/blog-series';
import { seriesPath } from '@/lib/blog-series-slugs';
import { byNewest, byEpisode } from '@/lib/blog-sort';

const EN_TETE = `# Hippodoc

> Cockpit financier pour médecins en France : calcule revenus, cotisations URSSAF, CARMF, impôts et Super-Net pour remplaçants, installés, collaborateurs et salariés.

Hippodoc est un logiciel français créé par un médecin pour les médecins remplaçants : il centralise revenus, rétrocessions, planning, contrats, cotisations URSSAF et CARMF, et prépare les déclarations (2035, 2042, DSFU/PAMC) avec un calcul automatique du Super-Net (ce qu'il reste vraiment après cotisations et impôts). Estimations conservatrices, conformes au CGI 2026.

Tarifs : 29 €/mois en mensuel ou 19 €/mois en facturation annuelle (228 €/an). Essai gratuit de 30 jours. Inscription : https://app.hippodoc.fr

Contact : contact@hippodoc.fr

## Pages

- [Accueil](https://www.hippodoc.fr/): Présentation du cockpit financier des médecins remplaçants et essai gratuit 30 jours.
- [Simulateur Super-Net](https://www.hippodoc.fr/simulateur): Estime le revenu net après impôts et cotisations selon ton profil (remplaçant, installé, mixte).
- [Guide des déclarations](https://www.hippodoc.fr/guide-declarations): Boussole interactive pour la déclaration 2035, 2042 et DSFU (volet PAMC), 12 profils médecins.
- [Calculette PAMC](https://www.hippodoc.fr/guide-declarations/calculette): Calculette publique des cases sociales DSFU (DSCS, DSAV, DSFA, DSDE, DSCN…).
- [DSFU (ex DS-PAMC) : les 15 cases du médecin](https://www.hippodoc.fr/guide-declarations/dsfu-pamc): DSCS, DSAV, DSDE, DSDX, DSFA… les 15 cases de la DSFU expliquées une par une : ce que l'URSSAF attend, qui remplit, et le pré-remplissage à corriger.
- [2042-C-PRO médecin : 5HQ, 5QC et exonérations](https://www.hippodoc.fr/guide-declarations/2042-c-pro): Les 5 cases de la 2042-C-PRO du médecin libéral : 5HQ en micro-BNC, 5QC au réel, et les cases d'exonération ZFU-TE, FRR et JEI. Ce que chacune attend.
- [Déclaration médecin remplaçant : cases et pièges](https://www.hippodoc.fr/guide-declarations/medecin-remplacant): Micro-BNC ou réel, 5HQ ou 5QC, DSCS et DSAV côté URSSAF : les cases que remplit un médecin remplaçant, et les erreurs qui reviennent chaque année.
- [Tarifs](https://www.hippodoc.fr/tarifs): Mensuel 29 €/mois ou annuel 19 €/mois, essai gratuit 30 jours, résiliation à tout moment.
- [Blog](https://www.hippodoc.fr/blog): Fiches pratiques fiscalité, cotisations, contrats et conseils pour médecins remplaçants.
- [FAQ](https://www.hippodoc.fr/faq): Questions fréquentes sur l'usage d'Hippodoc.
- [Comparatif](https://www.hippodoc.fr/comparatif): Hippodoc face aux autres solutions de gestion pour médecins remplaçants.
- [Qui sommes-nous](https://www.hippodoc.fr/qui-sommes-nous): L'équipe et la mission.`;

const OPTIONNEL = `## Optional

- [Mentions légales](https://www.hippodoc.fr/mentions-legales)
- [Politique de confidentialité](https://www.hippodoc.fr/politique-confidentialite)
- [RGPD](https://www.hippodoc.fr/rgpd)
- [Conditions d'utilisation](https://www.hippodoc.fr/conditions-utilisations)`;

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');
  const sections = blogSeries.map((s) => {
    const lignes = posts
      .filter((p) => p.data.seriesId === s.id)
      .sort(s.totalEpisodes === null ? byNewest : byEpisode)
      .map((p) => `- [${p.data.title}](${SITE_URL}/blog/${p.id}): ${p.data.description}`);
    return `## Blog — ${s.name}\n\nToute la série : ${SITE_URL}${seriesPath(s.id)}\n\n${lignes.join('\n')}`;
  });
  const corps = [EN_TETE, ...sections, OPTIONNEL].join('\n\n') + '\n';
  return new Response(corps, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
