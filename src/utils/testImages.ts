// Utilitaire pour tester la disponibilité des images

export const testImageUrls = [
  '/images/iphone.svg',
  '/images/macbook.svg',
  '/images/tshirt.svg',
  '/images/sofa.svg',
  '/images/bike.svg',
  '/placeholder-product.svg'
]

export const testImageLoad = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      // console.log('✅ Image disponible:', url)
      resolve(true)
    }
    img.onerror = () => {
      // console.log('❌ Image indisponible:', url)
      resolve(false)
    }
    img.src = url
  })
}

export const testAllImages = async (): Promise<void> => {
  // console.log('🧪 Test de disponibilité des images...')
  
  for (const url of testImageUrls) {
    await testImageLoad(url)
  }
  
  // console.log('🏁 Test terminé')
}

// Fonction à appeler dans la console pour tester
export const runImageTest = () => {
  testAllImages()
}
