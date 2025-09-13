import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface AnimatedCounterProps {
  end: number
  duration?: number
  decimals?: boolean
  suffix?: string
  className?: string
  startAnimation?: boolean
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  duration = 2,
  decimals = false,
  suffix = '',
  className = '',
  startAnimation = false
}) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!startAnimation) return

    let startTime: number | null = null
    const startValue = 0

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)

      // Fonction d'easing pour une animation plus naturelle
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
      const easedProgress = easeOutCubic(progress)

      const currentCount = startValue + (end - startValue) * easedProgress
      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration, startAnimation])

  const formatNumber = (num: number) => {
    if (decimals) {
      return num.toFixed(1)
    }
    return Math.floor(num).toLocaleString('fr-FR')
  }

  return (
    <motion.span 
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {formatNumber(count)}{suffix}
    </motion.span>
  )
}

export default AnimatedCounter
