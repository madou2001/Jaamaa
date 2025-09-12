interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
}

export const setSEO = ({
  title = 'Jaayma - E-commerce Moderne',
  description = 'Découvrez notre sélection exclusive de produits de qualité. Votre satisfaction est notre priorité.',
  keywords = 'e-commerce, produits, qualité, shopping en ligne',
  image = '/og-image.jpg',
  url,
  type = 'website'
}: SEOProps = {}) => {
  // Update document title
  document.title = title

  // Update meta tags
  const updateMetaTag = (name: string, content: string) => {
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = name
      document.head.appendChild(meta)
    }
    meta.content = content
  }

  const updatePropertyTag = (property: string, content: string) => {
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('property', property)
      document.head.appendChild(meta)
    }
    meta.content = content
  }

  // Basic meta tags
  updateMetaTag('description', description)
  updateMetaTag('keywords', keywords)

  // Open Graph tags
  updatePropertyTag('og:title', title)
  updatePropertyTag('og:description', description)
  updatePropertyTag('og:image', image)
  updatePropertyTag('og:url', url)
  updatePropertyTag('og:type', type)
  updatePropertyTag('og:site_name', 'Jaayma')

  // Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image')
  updateMetaTag('twitter:title', title)
  updateMetaTag('twitter:description', description)
  updateMetaTag('twitter:image', image)

  // Canonical URL (only if url is provided)
  if (url) {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url
  }
}

export const productSEO = (product: any) => {
  setSEO({
    title: `${product.name} - Jaayma`,
    description: product.description || `Découvrez ${product.name} sur Jaayma. Produit de qualité à prix compétitif.`,
    keywords: `${product.name}, ${product.categories?.name || ''}, e-commerce, achat en ligne`,
    image: product.images?.[0] || '/og-image.jpg',
    type: 'product'
  })
}

export const categorySEO = (category: any) => {
  setSEO({
    title: `${category.name} - Jaayma`,
    description: category.description || `Découvrez tous nos produits dans la catégorie ${category.name}.`,
    keywords: `${category.name}, produits, e-commerce, shopping en ligne`,
    type: 'website'
  })
}
