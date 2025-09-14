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
      resolve(true)
    }
    img.onerror = () => {
      resolve(false)
    }
    img.src = url
  })
}

export const testAllImages = async (): Promise<void> => {
  
  for (const url of testImageUrls) {
    await testImageLoad(url)
  }
  
}

// Fonction à appeler dans la console pour tester
export const runImageTest = () => {
  testAllImages()
}
