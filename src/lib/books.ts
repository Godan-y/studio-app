
import { Timestamp } from 'firebase/firestore';

export interface Book {
  id: string;
  chariow_id?: string;
  title: string;
  author: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  coverImage: string;
  tags: string[];
  s3_pdf_path: string;
  isPopular?: boolean;
  isNew?: boolean;
  created_at?: Timestamp | null;
}

const S3_BASE_URL = "https://gm-biblio-storage.s3.eu-west-3.amazonaws.com/";

/**
 * Fonction utilitaire pour transformer un document Firestore en objet Book.
 */
export function mapFirestoreDocToBook(doc: any): Book {
  if (!doc) {
    return {
      id: "unknown",
      title: "Livre inconnu",
      author: "Auteur inconnu",
      description: "Aucune donnée disponible.",
      price: 0,
      currency: "FC",
      category: "Autre",
      coverImage: "https://picsum.photos/seed/unknown/400/600",
      s3_pdf_path: "",
      tags: [],
    };
  }

  const data = doc.data ? doc.data() : doc;
  
  if (!data) {
    return {
      id: doc.id || "unknown",
      title: "Livre inconnu",
      author: "Auteur inconnu",
      description: "Aucune donnée disponible.",
      price: 0,
      currency: "FC",
      category: "Autre",
      coverImage: `https://picsum.photos/seed/${doc.id || 'unknown'}/400/600`,
      s3_pdf_path: "",
      tags: [],
    };
  }
  
  let coverImage = "";
  const rawCoverUrl = data.s3_cover_url || "";

  if (rawCoverUrl) {
    if (rawCoverUrl.startsWith('http') || rawCoverUrl.startsWith('https') || rawCoverUrl.startsWith('data:')) {
      coverImage = rawCoverUrl;
    } else {
      coverImage = `${S3_BASE_URL}${rawCoverUrl}`;
    }
  } else {
    coverImage = `https://picsum.photos/seed/${doc.id}/400/600`;
  }

  return {
    id: doc.id || "",
    chariow_id: data.chariow_id || "", 
    title: data.title || data.nom_original || "Livre sans titre",
    author: data.author || "Auteur inconnu",
    description: data.summary || "Aucun résumé disponible pour ce livre.",
    price: data.price || 0,
    currency: "FC",
    category: data.category || "Autre",
    coverImage: coverImage,
    s3_pdf_path: data.s3_pdf_path || "",
    tags: data.tags || [],
    isPopular: true,
    isNew: false, 
    created_at: data.created_at || null
  };
}

export const CATEGORIES = [
  "Tous",
  "Business",
  "Informatique",
  "Roman",
  "Développement personnel",
  "Autre"
];
