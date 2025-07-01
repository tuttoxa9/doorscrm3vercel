"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Children,
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMobileDetection } from "@/hooks/use-mobile-detection";

function DockItem({
  children,
  className = "",
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  isMobile,
  isTouch,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  mouseX: ReturnType<typeof useMotionValue>;
  spring: Parameters<typeof useSpring>[1];
  distance: number;
  magnification: number;
  baseItemSize: number;
  isMobile: boolean;
  isTouch: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    if (isMobile || isTouch) return distance; // Отключаем magnification на тач-устройствах

    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, isMobile ? baseItemSize : magnification, baseItemSize]
  );

  // Упрощенная анимация для мобильных
  const mobileSpringConfig = { mass: 0.1, stiffness: 300, damping: 30 };
  const size = useSpring(isMobile ? baseItemSize : targetSize, isMobile ? mobileSpringConfig : spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size,
      }}
      onHoverStart={() => !isMobile && isHovered.set(1)}
      onHoverEnd={() => !isMobile && isHovered.set(0)}
      onFocus={() => !isMobile && isHovered.set(1)}
      onBlur={() => !isMobile && isHovered.set(0)}
      onTouchStart={() => isMobile && isHovered.set(1)}
      onTouchEnd={() => isMobile && isHovered.set(0)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClick) {
          onClick();
        }
      }}
      className={`relative inline-flex items-center justify-center rounded-full bg-background border border-border shadow-md cursor-pointer transition-colors hover:bg-accent active:scale-95 ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onClick) {
            onClick();
          }
        }
      }}
      // Оптимизация для производительности
      whileTap={isMobile ? { scale: 0.95 } : undefined}
    >
      {Children.map(children, (child) =>
        cloneElement(child as React.ReactElement, { isHovered })
      )}
    </motion.div>
  );
}

function DockLabel({
  children,
  className = "",
  isHovered,
  isMobile
}: {
  children: React.ReactNode;
  className?: string;
  isHovered?: ReturnType<typeof useMotionValue>;
  isMobile?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on("change", (latest: number) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  // Отключаем тултипы на мобильных для экономии ресурсов
  if (isMobile) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.15 }} // Ускоряем анимацию
          className={`${className} absolute -top-8 left-1/2 w-fit whitespace-pre rounded-md border border-border bg-popover px-2 py-0.5 text-xs text-popover-foreground z-50`}
          role="tooltip"
          style={{ x: "-50%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({
  children,
  className = "",
  isMobile
}: {
  children: React.ReactNode;
  className?: string;
  isMobile?: boolean;
}) {
  return (
    <div className={`flex items-center justify-center ${isMobile ? 'text-sm' : ''} ${className}`}>
      {children}
    </div>
  );
}

export interface DockItem {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}

export default function DockOptimized({
  items,
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 64,
  dockHeight = 256,
  baseItemSize = 50,
}: {
  items: DockItem[];
  className?: string;
  spring?: Parameters<typeof useSpring>[1];
  magnification?: number;
  distance?: number;
  panelHeight?: number;
  dockHeight?: number;
  baseItemSize?: number;
}) {
  const { isMobile, isLowEndDevice } = useMobileDetection();
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const [isTouch, setIsTouch] = useState(false);

  // Адаптивные размеры для мобильных
  const adaptiveBaseItemSize = isMobile ? Math.min(baseItemSize * 0.8, 40) : baseItemSize;
  const adaptivePanelHeight = isMobile ? Math.min(panelHeight * 0.8, 50) : panelHeight;
  const adaptiveMagnification = isMobile ? adaptiveBaseItemSize : magnification;

  // Упрощенная пружинная анимация для слабых устройств
  const optimizedSpring = isLowEndDevice
    ? { mass: 0.2, stiffness: 300, damping: 30 }
    : spring;

  const maxHeight = useMemo(
    () => Math.max(dockHeight, adaptiveMagnification + adaptiveMagnification / 2 + 4),
    [adaptiveMagnification, dockHeight]
  );

  const heightRow = useTransform(
    isHovered,
    [0, 1],
    [adaptivePanelHeight, isMobile ? adaptivePanelHeight : maxHeight]
  );

  const height = useSpring(isMobile ? adaptivePanelHeight : heightRow, optimizedSpring);

  // Детектим тач-устройства
  useEffect(() => {
    const handleTouchStart = () => setIsTouch(true);
    const handleMouseMove = () => setIsTouch(false);

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Разбиваем элементы на группы для мобильных если слишком много
  const displayItems = useMemo(() => {
    if (!isMobile || items.length <= 8) return items;

    // Показываем только основные элементы на маленьких экранах
    return items.slice(0, 6).concat([
      {
        icon: <span className="text-xs">⋯</span>,
        label: "Еще",
        className: "cursor-pointer"
      }
    ]);
  }, [items, isMobile]);

  return (
    <motion.div
      style={{ height, scrollbarWidth: "none" }}
      className={`mx-2 flex max-w-full items-center fixed bottom-0 left-0 right-0 z-[100] ${
        isMobile ? 'px-1' : ''
      }`}
    >
      <motion.div
        onMouseMove={({ pageX }) => {
          if (!isMobile && !isTouch) {
            isHovered.set(1);
            mouseX.set(pageX);
          }
        }}
        onMouseLeave={() => {
          if (!isMobile && !isTouch) {
            isHovered.set(0);
            mouseX.set(Infinity);
          }
        }}
        className={`${className} absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-end w-fit gap-${isMobile ? '2' : '4'} rounded-2xl border border-border bg-background/80 backdrop-blur-md pb-2 px-${isMobile ? '2' : '4'} shadow-lg ${
          isMobile ? 'max-w-[95vw] overflow-x-auto scrollbar-hide' : ''
        }`}
        style={{ height: adaptivePanelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {displayItems.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={optimizedSpring}
            distance={distance}
            magnification={adaptiveMagnification}
            baseItemSize={adaptiveBaseItemSize}
            isMobile={isMobile}
            isTouch={isTouch}
          >
            <DockIcon isMobile={isMobile}>{item.icon}</DockIcon>
            <DockLabel isMobile={isMobile}>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}
