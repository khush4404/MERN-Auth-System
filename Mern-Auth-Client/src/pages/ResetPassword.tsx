import { useForm } from "react-hook-form";
import Input from "../utils/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "../utils/toast";
import { BackButton, Button } from "../utils/Button";
import type { ResetPasswordType } from "../types/UserTypes";
import { ResetPasswordschema } from "../shemas/UserShema";

export const ResetPassword = () => {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<ResetPasswordType>({ resolver: yupResolver(ResetPasswordschema) });

    const onSubmit = async (data: ResetPasswordType) => {
        try {
            await axios.post(
                `${import.meta.env.VITE_BASE_URL}reset-password`,
                data,
                { withCredentials: true }
            );
            toast.success("Password updated successfully");
            reset();
            navigate(-1);
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        }
    };

    return (
        <>
            <div className="min-h-[100dvh-75px] flex flex-col text-gray-900 dark:text-white bg-[radial-gradient(ellipse_at_50%_50%,_#f3f4f6_0%,_#f9fafb_100%)] dark:bg-[radial-gradient(ellipse_at_70%_30%,_#23283b_0%,_#10131a_100%)] p-4 sm:p-10 my-auto">
                <div className="w-full max-w-md mx-auto rounded-2xl shadow-md bg-white dark:bg-primaryBg p-5 sm:p-10 flex flex-col gap-4 sm:gap-8 border border-btnGrFromLight dark:border-darkBorder">
                    <div className="flex flex-col items-center gap-1 sm:gap-2">
                        <div className="mb-2">
                            <span className="text-3xl">🚀</span>
                        </div>
                        <h2 className="text-2xl font-bold dark:bg-gradient-to-r dark:from-textGrFrom dark:to-textGrTo bg-[linear-gradient(92.77deg,#080C1D_7.73%,#7E808C_99.72%)] bg-clip-text text-transparent">Striked</h2>
                        <p className="text-gray-500 dark:text-textGrayMedium text-sm">Reset your password</p>
                        <p className="text-xs text-textGrayMedium dark:text-gray-500">Enter your old and new password</p>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-6" noValidate>
                        <div className="flex flex-col gap-3 sm:gap-4">
                            <Input
                                name="oldPassword"
                                type="password"
                                label="Old Password"
                                placeholder="Enter old password"
                                register={register}
                                error={errors.oldPassword?.message}
                            />
                            <Input
                                name="newPassword"
                                type="password"
                                label="New Password"
                                placeholder="Enter new password"
                                register={register}
                                error={errors.newPassword?.message}
                            />
                            <Input
                                name="confirmPassword"
                                type="password"
                                label="Confirm New Password"
                                placeholder="Confirm new password"
                                register={register}
                                error={errors.confirmPassword?.message}
                            />
                        </div>
                        <div className="flex flex-col gap-3 justify-between">
                            <Button
                                type="submit"
                                text="Update Password" />
                            <BackButton text="Back" onClick={() => navigate(-1)} />
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};
