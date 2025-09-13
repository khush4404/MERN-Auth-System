import React, { useState, useRef } from "react";
import type { ChangeEvent } from "react";

interface OtpInputProps {
    onOtpChange: (otp: number) => void;
    disbaled?: boolean;
    className?: string;
    containerClass?: string;
    otpDigit?: number;
}

const OtpInput: React.FC<OtpInputProps> = ({
    onOtpChange,
    disbaled,
    className = "",
    containerClass = "",
    otpDigit = 4,
}) => {
    const [otp, setOtp] = useState<string[]>(Array(otpDigit).fill(""));
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const handleInputChange = (index: number, value: string) => {
        // Allow only digits
        if (!/^[0-9]*$/.test(value)) return;

        const newOtp = [...otp];
        // If user pastes or types more than one digit, fill accordingly
        if (value.length > 1) {
            // Only take the last digit if overfilled
            value = value.slice(-1);
        }
        newOtp[index] = value;
        setOtp(newOtp);

        const joined = newOtp.join("");
        if (joined.length === otpDigit && /^[0-9]+$/.test(joined)) {
            onOtpChange(Number(joined));
        } else {
            onOtpChange(NaN);
        }

        if (index < otpDigit - 1 && value !== "") {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pastedData = e.clipboardData.getData("Text");
        if (pastedData.length === otpDigit && /^[0-9]+$/.test(pastedData)) {
            e.preventDefault();

            const newOtp = pastedData.split("");
            setOtp(newOtp);
            onOtpChange(Number(pastedData));

            // Focus on the last input field
            inputRefs.current[otpDigit - 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        // Handle the 'Backspace' key
        if (e.key === "Backspace" && index > 0) {
            // Prevent the default behavior of the Backspace key
            e.preventDefault();

            if (e.currentTarget.value) {
                // Set the previous input value to an empty string
                handleInputChange(index, "");
                // Move focus to the previous input
                inputRefs.current[index]?.focus();
            } else {
                // Set the previous input value to an empty string
                handleInputChange(index - 1, "");
                // Move focus to the previous input
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    return (
        <div className={`${containerClass} flex gap-4 phone:gap-3 sm:gap-6 justify-center otp-input`}>
            {otp.map((value, index) => (
                <input
                    key={index}
                    ref={el => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(index, e.target.value)}
                    disabled={disbaled}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    placeholder="-"
                    className={`OTPInput ${className} w-12 h-12 sm:w-16 sm:h-16 rounded-xl border border-btnGrFromLightHover bg-btnGrFromLight text-[#1f2937] dark:border-darkBorder dark:bg-darkBorder dark:text-white text-2xl sm:text-3xl text-center focus:outline-none focus:border-blue-500 transition-all duration-150 shadow-md`
                    }
                    style={{
                        WebkitAppearance: "none",
                        MozAppearance: "textfield",
                    }}
                />
            ))}
        </div>
    );
};

export default OtpInput;
