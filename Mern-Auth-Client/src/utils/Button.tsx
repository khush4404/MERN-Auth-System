import { cn } from "./cn";

type ButtonProps = {
    type?: "button" | "submit" | "reset";
    className?: string;
    text?: string;
    onClick?: () => void;
    disabled?: boolean;
};

export const Button = ({
    type = "button",
    className,
    text,
    onClick,
    disabled = false,
}: ButtonProps) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                `
          w-full py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold shadow-sm
          transition-colors duration-300

          text-gray-800 dark:text-white

          bg-gradient-to-r from-btnGrFromLight to-btnGrToLight
          hover:from-btnGrFromLightHover hover:to-btnGrToLight

          dark:bg-gradient-to-r dark:from-btnGrFrom dark:to-btnGrTo
          dark:hover:from-btnGrFromHover dark:hover:to-primary
        `,
                className
            )}
        >
            {text}
        </button>
    );
};


export const BackButton = ({
    className,
    text,
    onClick,
}: ButtonProps) => {
    return (
        <p className={cn(`text-center text-textGrayMedium text-xs`, className)}>
            <span className="text-base bg-gradient-to-r from-backBtnGrFromLight to-backBtnGrToLight hover:from-backBtnGrToLight hover:to-backBtnGrFromLight dark:bg-gradient-to-r dark:from-textGrFrom dark:to-textGrTo dark:hover:from-btnGrFromHover dark:hover:to-primary bg-clip-text text-transparent cursor-pointer hover:underline transition-colors duration-300" onClick={onClick}>{text}</span>
        </p>
    );
}