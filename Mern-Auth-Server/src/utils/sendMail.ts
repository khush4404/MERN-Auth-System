import nodemailer from "nodemailer";

export const sendMail = async (to: string, subject: string, text: string) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER!,
                pass: process.env.EMAIL_PASS!,
            },
        });

        await transporter.sendMail({
            from: `"MERN Auth App" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        });

    } catch (error) {
        // console.error("❌ Failed to send email:", error);
        throw new Error("Email could not be sent");
    }
};
