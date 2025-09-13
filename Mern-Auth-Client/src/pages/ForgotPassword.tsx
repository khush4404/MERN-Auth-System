import { useForm } from "react-hook-form";
import Input from "../utils/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import OtpInput from "../utils/otpInput";
import axios from "axios";
import Navbar from "../component/layout/Navbar";
import type { SubmitHandler } from "react-hook-form";
import { toast } from "../utils/toast";
import { Button } from "../utils/Button";
import { Forgotschema } from "../shemas/UserShema";
import type { ForgotPasswordFormData } from "../types/UserTypes";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [enteredEmail, setEnteredEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: yupResolver(Forgotschema),
        defaultValues: {
            email: "",
            step: 1,
        },
    });

    const formStep = watch("step");

    const onsubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        if (step === 1) {
            const payload = { email: data.email, step: 1 }
            try {
                await axios.post(`${import.meta.env.VITE_BASE_URL}forgot-password`, payload);
                setEnteredEmail(data.email);
                toast.success("OTP sent to your email!");
                setStep(2);
                setValue("step", 2);
            } catch (error: unknown) {
                if (axios.isAxiosError(error) && error.response) {
                    const { status, data } = error.response;
                    switch (status) {
                        case 401:
                            toast.error("Invalid email. Please try again.");
                            break;
                        case 500:
                            toast.error("Server error. Please try again later.");
                            break;
                        default:
                            toast.error(data.message || "Something went wrong.");
                    }
                } else {
                    toast.error("Network error. Please check your connection.");
                }
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        if (step === 2) {
            const payload = { email: data.email, otp: data.otp, step: 2 };
            try {
                await axios.post(`${import.meta.env.VITE_BASE_URL}forgot-password`, payload);
                toast.success("OTP verified successfully!");
                setStep(3);
                setValue("step", 3);
            } catch (error: unknown) {
                if (axios.isAxiosError(error) && error.response) {
                    const { status, data } = error.response;
                    switch (status) {
                        case 400:
                            toast.error("Invalid OTP.");
                            break;
                        case 401:
                            toast.error("Invalid email.");
                            break;
                        case 500:
                            toast.error("Server error.");
                            break;
                        default:
                            toast.error(data.message || "OTP verification failed.");
                    }
                } else {
                    toast.error("Network error.");
                }
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        if (step === 3) {
            const payload = { email: data.email, otp: data.otp, password: data.password, confirmPassword: data.confirmPassword, step: 3 };
            try {
                await axios.post(`${import.meta.env.VITE_BASE_URL}forgot-password`, payload);
                toast.success("Password reset successfully!");
                setStep(4);
                reset();
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    const { status, data } = error.response;
                    switch (status) {
                        case 400:
                            toast.error("Passwords do not match.");
                            break;
                        case 401:
                            toast.error("Invalid email.");
                            break;
                        case 402:
                            toast.error("You Can't use Recent password.");
                            break;
                        case 500:
                            toast.error("Something went wrong on the server.");
                            break;
                        default:
                            toast.error(data.message || "Password reset failed.");
                    }
                } else {
                    toast.error("Network error.");
                }
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="min-h-dvh flex flex-col text-gray-900 dark:text-white bg-[radial-gradient(ellipse_at_50%_50%,_#f3f4f6_0%,_#f9fafb_100%)] dark:bg-[radial-gradient(ellipse_at_70%_30%,_#23283b_0%,_#10131a_100%)]">
            <Navbar />
            <div className="w-full flex items-center justify-center my-auto h-full p-4 sm:p-10">
                <div className="w-full max-w-md mx-auto rounded-2xl shadow-md bg-white dark:bg-primaryBg p-4 sm:p-10 flex flex-col gap-4 sm:gap-8 border border-btnGrFromLight dark:border-darkBorder">
                    <div className="flex flex-col items-center gap-1 sm:gap-2">
                        <div className="mb-2">
                            <span className="text-3xl">🚀</span>
                        </div>
                        <h2 className="text-2xl font-bold dark:bg-gradient-to-r dark:from-textGrFrom dark:to-textGrTo bg-[linear-gradient(92.77deg,#080C1D_7.73%,#7E808C_99.72%)] bg-clip-text text-transparent">Striked</h2>
                        <p className="text-gray-500 dark:text-textGrayMedium text-sm">
                            {step === 1 && "Forgot your password?"}
                            {step === 2 && "Verify your email"}
                            {step === 3 && "Reset your password"}
                        </p>
                        <p className="text-xs text-textGrayMedium dark:text-gray-500">
                            {step === 1 && "Enter your email to receive a reset code."}
                            {step === 2 && `Enter the OTP sent to ${enteredEmail}`}
                            {step === 3 && "Set a new password for your account."}
                        </p>
                    </div>
                    {step === 4 ? (
                        <div className="flex flex-col items-center gap-6 text-center">
                            <div className="mb-2">
                                <span className="text-3xl">✅</span>
                            </div>
                            <h2 className="text-black dark:text-white text-2xl font-bold">Reset Success</h2>
                            <p className="text-textGrayMedium text-sm">Your password has been reset</p>

                            <Button
                                onClick={() => navigate('/login')}
                                text="Go to Sign in"
                            />
                        </div>
                    ) : (
                        <>
                            <form onSubmit={handleSubmit(onsubmit)} className="flex flex-col gap-4 sm:gap-6 w-full" noValidate>
                                <input type="hidden" value={formStep} {...register("step")} />
                                {step === 1 && (
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        label="Email Address"
                                        register={register}
                                        error={errors.email?.message}
                                    />
                                )}
                                {step === 2 && (
                                    <div className="flex flex-col gap-2">
                                        <OtpInput
                                            onOtpChange={(otp: number) => setValue("otp", otp.toString())}
                                        />
                                        {errors.otp && <span className="text-red-500 text-xs">{errors.otp.message}</span>}
                                    </div>
                                )}
                                {step === 3 && (
                                    <>
                                        <Input
                                            name="password"
                                            type="password"
                                            placeholder="Enter your Password"
                                            label="Password"
                                            register={register}
                                            error={errors.password?.message}
                                        />
                                        <Input
                                            name="confirmPassword"
                                            type="password"
                                            placeholder="Enter Confirm Password"
                                            label="Confirm Password"
                                            register={register}
                                            error={errors.confirmPassword?.message}
                                        />
                                    </>
                                )}

                                <Button
                                    type="submit"
                                    text={
                                        step === 1
                                            ? isSubmitting
                                                ? "Sending..."
                                                : "Continue"
                                            : step === 2
                                                ? "Verify OTP"
                                                : step === 3
                                                    ? "Reset Password"
                                                    : ""
                                    }
                                />
                            </form>
                            <div className="text-center text-textGrayMedium text-xs">
                                Back to {" "}
                                <Link to="/login" className="dark:text-blue-400 text-sm text-black hover:underline">
                                    Sign in
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
