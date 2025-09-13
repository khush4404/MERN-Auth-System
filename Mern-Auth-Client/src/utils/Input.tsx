/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { cn } from "./cn";
import type { UseFormRegister } from "react-hook-form";
import { Eye, EyeClosed } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    name: string;
    placeholder?: string;
    label?: React.ReactNode;
    error?: string;
    register?: UseFormRegister<any>;
    id?: string;
    type?: string;
    disabled?: boolean;
    required?: boolean;
    showErrorPlace?: boolean;
    labelClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const { name, className, type = "text", label, error, placeholder, id, disabled, required, register, showErrorPlace, labelClassName, ...rest } = props;

    const inputType = type || "text";
    const [showPassword, setShowPassword] = React.useState(false);

    return (
        <div className="w-full flex flex-col">
            {label && (
                <label htmlFor={id || name} className={cn("text-gray-700 dark:text-btnGrToLight text-xs font-semibold mb-0.5 sm:mb-1", labelClassName)}>{label}</label>
            )}
            <div className="relative">
                <input
                    ref={ref}
                    type={inputType === "password" && showPassword ? "text" : inputType}
                    id={id || name}
                    className={cn("block relative px-2 sm:px-3 py-2 sm:py-3 mt-0.5 sm:mt-1 w-full leading-tight rounded-md border appearance-none focus:z-10 focus:border-gray-500 focus:outline-none disabled:opacity-75 bg-bgLight dark:bg-darkBorder text-gray-900 dark:text-white border-btnGrFromLight dark:border-darkBorder placeholder-textGrayMedium dark:placeholder-gray-500 text-sm sm:text-base", className)}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    {...(register && register(name))}
                    {...rest}
                />
                {inputType === "password" && (
                    <div className="absolute inset-y-0 mt-0.5 sm:mt-1 right-0 flex items-center pr-3 cursor-pointer z-10" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeClosed className="sm:h-5 h-4 sm:w-5 w-4 text-gray-500" /> : <Eye className="sm:h-5 h-4 sm:w-5 w-4 text-gray-500" />}
                    </div>
                )}
            </div>
            {(showErrorPlace || error) && (
                <span className="text-red-500 sm:text-base text-sm">
                    {error && <span>{error}</span>}
                    &nbsp;
                </span>
            )}
        </div>
    )
});
export default Input;