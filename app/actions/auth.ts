"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth, signIn } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";

const UserSchema = z.object({
    email: z.string().email("유효한 이메일 형식이 아닙니다."),
    password: z
        .string()
        .min(8, "비밀번호는 8자 이상이어야 합니다."),
    confirmPassword: z.string(),
    name: z.string().min(1, "이름을 입력해주세요."),
    nickname: z.string().optional(),
    turnstileToken: z.string().min(1, "스팸 방지 검증을 완료해주세요."),
}).refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
});

export async function signup(prevState: string | undefined, formData: FormData) {
    try {
        const rawData = Object.fromEntries(formData.entries());
        const validatedFields = UserSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return "입력 값이 유효하지 않습니다.";
        }

        const { email, password, name, nickname, turnstileToken } = validatedFields.data;

        // Verify Turnstile Token
        const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;

        // Dynamic Fallback: If secret is missing or we explicitly passed a bypass token
        if (!turnstileSecret || turnstileToken === "PASSED_BY_NO_KEY") {
            console.warn("Turnstile verification skipped due to missing secret or bypass token.");
        } else {
            const verifyRes = await fetch(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        secret: turnstileSecret,
                        response: turnstileToken,
                    }),
                }
            );

            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
                return "스팸 검증에 실패했습니다. 다시 시도해주세요.";
            }
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return "이미 사용 중인 이메일입니다.";
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if email is in ADMIN_EMAILS
        const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
        const role = adminEmails.includes(email) ? "ADMIN" : "USER";

        // Create user
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                nickname,
                role,
            },
        });

        // Attempt login (optional, or just redirect)
        // We can't use signIn here directly if we want to redirect to login page with success message
        // But usually autofill login is nicer.
        // For now, let's return success and let client handle redirect
        return "success";
    } catch (error) {
        console.error("Signup error:", error);
        return "회원가입 중 오류가 발생했습니다.";
    }
}

export async function updateProfile(nickname: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "권한이 없습니다." };

        await prisma.user.update({
            where: { id: session.user.id },
            data: { nickname },
        });

        return { success: true };
    } catch (error) {
        console.error("Profile update error:", error);
        return { error: "정보 수정 중 오류가 발생했습니다." };
    }
}

export async function deleteAccount() {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "권한이 없습니다." };

        await prisma.user.delete({
            where: { id: session.user.id },
        });

        return { success: true };
    } catch (error) {
        console.error("Account delete error:", error);
        return { error: "회원 탈퇴 중 오류가 발생했습니다." };
    }
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData
) {
    try {
        await signIn("credentials", formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "이메일 또는 비밀번호가 올바르지 않습니다.";
                default:
                    return "로그인 중 오류가 발생했습니다.";
            }
        }
        throw error;
    }
}
