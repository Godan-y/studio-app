'use server';
/**
 * @fileOverview Un flux Genkit pour recommander des livres similaires basés sur les détails d'un livre donné.
 *
 * - recommendSimilarBooks - Une fonction qui gère le processus de recommandation de livres similaires.
 * - SimilarBooksRecommendationInput - Le type d'entrée pour la fonction recommendSimilarBooks.
 * - SimilarBooksRecommendationOutput - Le type de sortie pour la fonction recommendSimilarBooks.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimilarBooksRecommendationInputSchema = z.object({
  bookTitle: z.string().describe("Le titre du livre actuel."),
  bookDescription: z.string().describe("Une brève description ou un résumé du livre actuel."),
  bookCategories: z.array(z.string()).describe("Une liste de catégories ou de genres auxquels appartient le livre actuel."),
  bookAuthor: z.string().optional().describe("L'auteur du livre actuel, si disponible."),
});
export type SimilarBooksRecommendationInput = z.infer<typeof SimilarBooksRecommendationInputSchema>;

const SimilarBookSchema = z.object({
  title: z.string().describe("Le titre du livre similaire recommandé."),
  author: z.string().optional().describe("L'auteur du livre similaire recommandé, si connu."),
  reason: z.string().describe("Une courte explication de la raison pour laquelle ce livre est similaire au livre original."),
});

const SimilarBooksRecommendationOutputSchema = z.object({
  similarBooks: z.array(SimilarBookSchema).describe("Une liste de recommandations de livres similaires."),
});
export type SimilarBooksRecommendationOutput = z.infer<typeof SimilarBooksRecommendationOutputSchema>;

export async function recommendSimilarBooks(input: SimilarBooksRecommendationInput): Promise<SimilarBooksRecommendationOutput> {
  return similarBooksRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'similarBooksRecommendationPrompt',
  input: {schema: SimilarBooksRecommendationInputSchema},
  output: {schema: SimilarBooksRecommendationOutputSchema},
  prompt: `Vous êtes un expert en recommandations littéraires. Votre tâche est de suggérer des livres qui sont similaires à un livre donné.

Voici les détails du livre pour lequel vous devez trouver des recommandations :
Titre : {{{bookTitle}}}
Description : {{{bookDescription}}}
Catégories : {{#each bookCategories}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{#if bookAuthor}}Auteur : {{{bookAuthor}}}{{/if}}

Sur la base de ces détails, fournissez une liste de 3 à 5 recommandations de livres similaires. Pour chaque recommandation, incluez le titre du livre, son auteur (si connu) et une brève raison expliquant la similitude avec le livre original. Concentrez-vous sur des livres qui plairaient à quelqu'un qui a apprécié le titre original, en tenant compte du genre, des thèmes et du style d'écriture.

TOUTES VOS RÉPONSES (TITRES, AUTEURS, ET SURTOUT LA RAISON) DOIVENT ÊTRE EN FRANÇAIS.

Assurez-vous que votre sortie est un objet JSON correspondant au schéma fourni.`,
});

const similarBooksRecommendationFlow = ai.defineFlow(
  {
    name: 'similarBooksRecommendationFlow',
    inputSchema: SimilarBooksRecommendationInputSchema,
    outputSchema: SimilarBooksRecommendationOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
