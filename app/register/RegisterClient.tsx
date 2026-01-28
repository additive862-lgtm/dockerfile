"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signup } from "@/app/actions/auth";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/app/components/ui/card";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { Eye, EyeOff } from "lucide-react";

function SubmitButton({
    isVerify,
    isEmailAvailable,
    isPasswordMatch
}: {
    isVerify: boolean;
    isEmailAvailable: boolean;
    isPasswordMatch: boolean;
}) {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            className="w-full bg-[#CA0F19] hover:bg-[#B10D16]"
            disabled={pending || !isVerify || !isEmailAvailable || !isPasswordMatch}
        >
            {pending ? "가입 처리 중..." : "가입하기"}
        </Button>
    );
}

const initialState = "";

export default function RegisterClient({ siteKey }: { siteKey?: string }) {
    const [state, dispatch] = useFormState(signup, initialState);
    const [turnstileToken, setTurnstileToken] = useState("");
    const [emailExists, setEmailExists] = useState(false);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);

    // Password Confirmation States
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const turnstileContainerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    const isPasswordMatch = password.length >= 8 && password === confirmPassword;

    // Success redirect
    useEffect(() => {
        if (state === "success") {
            alert("회원가입이 완료되었습니다.");
            window.location.href = "/login";
        }
    }, [state]);

    // Handle missing Site Key (Fallback for local dev or unexpected config)
    useEffect(() => {
        if (!siteKey) {
            console.warn("Turnstile Site Key is missing. Spam protection disabled.");
            setTurnstileToken("PASSED_BY_NO_KEY");
        }
    }, [siteKey]);

    // Cleanup widget on unmount
    useEffect(() => {
        return () => {
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
            }
        };
    }, []);

    const checkEmail = async (email: string) => {
        if (!email || !email.includes("@")) return;

        setIsCheckingEmail(true);
        try {
            const res = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);
            const data = await res.json();
            setEmailExists(data.exists);
        } catch (error) {
            console.error("Email check failed:", error);
        } finally {
            setIsCheckingEmail(false);
        }
    };

    const initializeTurnstile = () => {
        if (window.turnstile && turnstileContainerRef.current && !widgetIdRef.current && siteKey) {
            try {
                const id = window.turnstile.render(turnstileContainerRef.current, {
                    sitekey: siteKey,
                    callback: (token: string) => {
                        console.log("Turnstile success:", token);
                        setTurnstileToken(token);
                    },
                    "error-callback": (err: unknown) => {
                        console.error("Turnstile error:", err);
                        setTurnstileToken("");
                    },
                    "expired-callback": () => {
                        console.warn("Turnstile expired");
                        setTurnstileToken("");
                    },
                });
                widgetIdRef.current = id;
            } catch (e) {
                console.error("Turnstile render error:", e);
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 py-10">
            {siteKey && (
                <Script
                    src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                    onLoad={initializeTurnstile}
                    strategy="afterInteractive"
                />
            )}


            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">회원가입</CardTitle>
                    <CardDescription className="text-center">
                        서비스 이용을 위해 정보를 입력해주세요
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-4">
                        {/* 이메일 */}
                        <div className="space-y-2">
                            <Label htmlFor="email">이메일 *</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="example@email.com"
                                required
                                onBlur={(e) => checkEmail(e.target.value)}
                                className={emailExists ? "border-red-500 focus-visible:ring-red-500" : ""}
                            />
                            {isCheckingEmail && <p className="text-xs text-slate-400">중복 확인 중...</p>}
                            {emailExists && (
                                <p className="text-xs text-red-500 font-medium">이미 가입된 메일입니다.</p>
                            )}
                        </div>

                        {/* 비밀번호 */}
                        <div className="space-y-2">
                            <Label htmlFor="password">비밀번호 * (8자 이상)</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className={password.length > 0 && password.length < 8 ? "border-red-500" : ""}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* 비밀번호 확인 */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className={
                                    confirmPassword.length > 0
                                        ? isPasswordMatch
                                            ? "border-green-500 focus-visible:ring-green-500 text-green-700"
                                            : "border-red-500 focus-visible:ring-red-500"
                                        : ""
                                }
                            />
                            {confirmPassword.length > 0 && !isPasswordMatch && password.length >= 8 && (
                                <p className="text-xs text-red-500 font-medium">비밀번호가 일치하지 않습니다.</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">이름 *</Label>
                            <Input id="name" type="text" name="name" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nickname">세례명 (선택)</Label>
                            <Input id="nickname" type="text" name="nickname" />
                        </div>

                        {/* Turnstile Widget Container */}
                        <div className="flex flex-col items-center justify-center py-4 min-h-[100px] border rounded-lg bg-slate-50/50">
                            {siteKey ? (
                                <>
                                    <div ref={turnstileContainerRef} id="turnstile-widget" />
                                    <input type="hidden" name="turnstileToken" value={turnstileToken} />
                                </>
                            ) : (
                                <div className="text-center p-2">
                                    <p className="text-sm text-red-500 font-bold">⚠️ 스팸 방지 설정 오류</p>
                                    <p className="text-xs text-slate-500 mt-1">관리자에게 문의하거나 환경변수 설정을 확인해주세요.</p>
                                </div>
                            )}
                        </div>

                        {/* Fallback msg if js not loaded */}
                        {siteKey && !turnstileToken && (
                            <p className="text-xs text-center text-slate-400">
                                스팸 방지 확인이 완료되면 버튼이 활성화됩니다.
                            </p>
                        )}
                        <br />

                        {state && state !== "success" && (
                            <div className="text-sm text-red-500 font-medium text-center">
                                {state}
                            </div>
                        )}

                        <SubmitButton
                            isVerify={!!turnstileToken}
                            isEmailAvailable={!emailExists}
                            isPasswordMatch={isPasswordMatch}
                        />
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-slate-600">
                        이미 계정이 있으신가요?{" "}
                        <Link href="/login" className="font-medium text-[#CA0F19] hover:underline">
                            로그인
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

// Add global type for turnstile
interface Turnstile {
    render: (
        container: HTMLElement | string,
        options: {
            sitekey: string;
            callback: (token: string) => void;
            "error-callback"?: (error: unknown) => void;
            "expired-callback"?: () => void;
        }
    ) => string;
    remove: (widgetId: string) => void;
}

declare global {
    interface Window {
        turnstile?: Turnstile;
    }
}
