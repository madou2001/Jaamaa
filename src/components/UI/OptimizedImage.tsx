import React, { useState } from 'react'
import { getProxyImageUrl, handleImageError, optimizeImageUrl } from '../../utils/imageUtils'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  quality?: number
  fallbackSrc?: string
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  quality = 80,
  fallbackSrc = '/placeholder-product.svg',
  loading = 'lazy',
  onLoad,
  onError
}) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleErrorEvent = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (!hasError) {
      setHasError(true)
      setIsLoading(false)
      event.currentTarget.src = fallbackSrc
      onError?.()
    }
  }

  const optimizedSrc = hasError 
    ? fallbackSrc 
    : getProxyImageUrl(optimizeImageUrl(src || '', width, height, quality))

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 smooth-loading rounded"></div>
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading={loading}
        onLoad={handleLoad}
        onError={handleErrorEvent}
        width={width}
        height={height}
      />
    </div>
  )
}

export default OptimizedImage
