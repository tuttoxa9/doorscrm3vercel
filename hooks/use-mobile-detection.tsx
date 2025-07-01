"use client"

import { useEffect, useState } from "react"

interface MobileDetection {
  isMobile: boolean
  isLowEndDevice: boolean
  supportsWebGL: boolean
  devicePixelRatio: number
}

export function useMobileDetection(): MobileDetection {
  const [detection, setDetection] = useState<MobileDetection>({
    isMobile: false,
    isLowEndDevice: false,
    supportsWebGL: true,
    devicePixelRatio: 1
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const checkDevice = () => {
      // Проверка на мобильное устройство
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768

      // Проверка поддержки WebGL
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      const supportsWebGL = !!gl

      // Проверка на слабое устройство
      const isLowEndDevice = (() => {
        // Проверяем количество логических процессоров
        const cores = navigator.hardwareConcurrency || 4

        // Проверяем доступную память (если поддерживается)
        const memory = (navigator as any).deviceMemory || 4

        // Проверяем user agent на старые или слабые устройства
        const isOldAndroid = /Android [1-4]\./i.test(navigator.userAgent)
        const isOldIOS = /OS [1-9]_/i.test(navigator.userAgent)

        return cores <= 2 || memory <= 2 || isOldAndroid || isOldIOS || isMobile
      })()

      const devicePixelRatio = window.devicePixelRatio || 1

      setDetection({
        isMobile,
        isLowEndDevice,
        supportsWebGL,
        devicePixelRatio
      })
    }

    checkDevice()

    // Переproверяем при изменении размера окна
    window.addEventListener("resize", checkDevice)

    return () => {
      window.removeEventListener("resize", checkDevice)
    }
  }, [])

  return detection
}
