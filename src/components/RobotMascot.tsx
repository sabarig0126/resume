interface RobotMascotProps {
  className?: string;
}

export const ASSISTANT_LOGO_SRC =
  '/assets/aistudio/WhatsApp_Image_2026-11-24_at_22.27.54_770d46e0.jpeg';

export function RobotMascot({ className = 'h-7 w-7' }: RobotMascotProps) {
  return (
    <img
      src={ASSISTANT_LOGO_SRC}
      alt="Sabari's Assistant logo"
      draggable={false}
      decoding="async"
      className={`${className} rounded-full object-cover object-center select-none`}
    />
  );
}
