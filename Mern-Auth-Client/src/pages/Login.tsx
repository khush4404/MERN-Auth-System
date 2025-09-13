import { useForm } from "react-hook-form";
import Input from "../utils/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../component/layout/Navbar";
import Icon from "../utils/Icon";
import { toast } from "../utils/toast";
import { Button } from "../utils/Button";
import type { LoginType } from "../types/UserTypes";
import { LoginSchema } from "../shemas/UserShema";

const Login = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginType>({ resolver: yupResolver(LoginSchema) });

    const onsubmit = async (data: LoginType) => {
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}login`, data, {
                withCredentials: true,
            });
            toast.success("Login successful!");
            navigate("/dashboard");
        }
        catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 400) {
                    toast.error("Invalid Password. Please try again.");
                } else if (error.response.status === 401) {
                    toast.error("Invalid Email. Please try again.");
                } else {
                    toast.error("Login failed. Please try again later.");
                }
            } else {
                toast.error("Network error. Please check your connection.");
            }
        }
    }
    return (
        <div
            className="min-h-dvh flex flex-col text-gray-900 dark:text-white bg-[radial-gradient(ellipse_at_50%_50%,_#f3f4f6_0%,_#f9fafb_100%)] dark:bg-[radial-gradient(ellipse_at_70%_30%,_#23283b_0%,_#10131a_100%)]"
        >
            <Navbar />
            <div className="w-full flex items-center justify-center my-auto h-full p-4 sm:p-10">
                <div className="w-full max-w-md mx-auto rounded-2xl shadow-md bg-white dark:bg-primaryBg p-5 sm:p-10 flex flex-col gap-4 sm:gap-8 border border-btnGrFromLight dark:border-darkBorder">
                    <div className="flex flex-col items-center gap-1 sm:gap-2">
                        {/* Logo placeholder */}
                        <div className="mb-2">
                            <span className="text-3xl">🚀</span>
                        </div>
                        <h2 className="text-2xl font-bold dark:bg-gradient-to-r dark:from-textGrFrom dark:to-textGrTo bg-[linear-gradient(92.77deg,#080C1D_7.73%,#7E808C_99.72%)] bg-clip-text text-transparent">Striked</h2>
                        <p className="text-gray-500 dark:text-textGrayMedium text-sm">Login with your credentials</p>
                        <p className="text-xs text-textGrayMedium dark:text-gray-500">Glad to have you back!</p>
                    </div>
                    <form onSubmit={handleSubmit(onsubmit)} className="flex flex-col gap-4 sm:gap-6" noValidate>
                        <div className="flex flex-col gap-3 sm:gap-4">
                            <Input
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                label={<span>Email Address <span className="text-red-500">*</span></span>}
                                register={register}
                                error={errors.email?.message}
                            />
                            <Input
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                label={<span>Password <span className="text-red-500">*</span></span>}
                                error={errors.password?.message}
                                register={register}
                            />
                            <div className="flex justify-end -mt-3">
                                <span
                                    className="dark:text-blue-400 text-xs cursor-pointer hover:underline"
                                    onClick={() => navigate("/forgot-password")}
                                >
                                    Forgot password?
                                </span>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            text="Sign in" />
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-px bg-btnGrFromLight dark:bg-darkBorder" />
                            <span className="text-textGrayMedium text-xs">OR</span>
                            <div className="flex-1 h-px bg-btnGrFromLight dark:bg-darkBorder" />
                        </div>
                        <div className="flex items-center justify-center gap-4">
                            <button type="button" className="flex items-center p-3 rounded-full bg-bgLight dark:bg-darkBorder text-gray-700 dark:text-btnGrFromLight hover:bg-btnGrFromLight dark:hover:bg-darkBorder/80 border border-btnGrFromLight dark:border-darkBorder text-sm font-medium gap-3 justify-start transition-colors duration-300">
                                <Icon icon="apple" className="sm:w-7 w-5 h-5 sm:h-7" />
                            </button>
                            <button type="button" className="flex items-center p-3 rounded-full bg-bgLight dark:bg-darkBorder text-gray-700 dark:text-btnGrFromLight hover:bg-btnGrFromLight dark:hover:bg-darkBorder/80 border border-btnGrFromLight dark:border-darkBorder text-sm font-medium gap-3 justify-start transition-colors duration-300">
                                <Icon icon="google" className="sm:w-7 w-5 h-5 sm:h-7" />
                            </button>
                            <button type="button" className="flex items-center p-3 rounded-full bg-bgLight dark:bg-darkBorder text-gray-700 dark:text-btnGrFromLight hover:bg-btnGrFromLight dark:hover:bg-darkBorder/80 border border-btnGrFromLight dark:border-darkBorder text-sm font-medium gap-3 justify-start transition-colors duration-300">
                                <Icon icon="facebook" className="sm:w-7 w-5 h-5 sm:h-7" />
                            </button>
                        </div>
                        <p className="text-center text-gray-500 dark:text-textGrayMedium text-xs">
                            Don’t have an account?{' '}
                            <span
                                className="text-gray-900 dark:text-blue-400 cursor-pointer hover:underline text-sm"
                                onClick={() => navigate("/register")}
                            >
                                Sign up
                            </span>
                        </p>
                    </form>
                </div>
            </div>
        </div>

    )
}

export default Login;