"use client"
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { z } from 'zod'
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import axiosInstance from '@/apiConfig'
import OTPInput from '@/components/OTPInput'

// Email form schema
const emailSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
})

// OTP validation schema
const otpSchema = z.object({
    otp: z.string().length(6, { message: "OTP must be 6 digits" }),
})

// Password validation schema with strong password requirements
const newPasswordSchema = z.object({
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(30, { message: "Password must be at most 30 characters long" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

/**
 * Steps in the password reset flow
 */
enum ResetStep {
    EMAIL = 'email',       // Initial step to collect user's email
    OTP = 'otp',           // Verify the OTP sent to user's email
    NEW_PASSWORD = 'new-password', // Set new password after verification
    COMPLETE = 'complete'  // Password reset successfully completed
}

/**
 * ResetPasswordPage Component
 * 
 * A multi-step form to handle the complete password reset flow:
 * 1. User enters email
 * 2. OTP sent to email and verified
 * 3. User creates new password
 * 4. Reset confirmation and redirect to login
 */
const ResetPasswordPage = () => {

    const [currentStep, setCurrentStep] = useState<ResetStep>(ResetStep.EMAIL)
    const [email, setEmail] = useState<string>('')
    const [token, setToken] = useState<string>('')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { toast } = useToast()

    // Form setup for each step
    const emailForm = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" }
    })

    const otpForm = useForm<z.infer<typeof otpSchema>>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" }
    })

    const passwordForm = useForm<z.infer<typeof newPasswordSchema>>({
        resolver: zodResolver(newPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        }
    })

    /**
     * Display error messages using toast notification
     */
    useEffect(() => {
        if (errorMessage) {
            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage
            })
            setErrorMessage(null)
        }
    }, [errorMessage, toast])

    /**
     * Request OTP to be sent to user's email
     */
    const handleSendOTP = async (values: z.infer<typeof emailSchema>) => {
        setIsLoading(true)
        try {
            await axiosInstance.post("/customers/forgot-password", {
                email: values.email
            })
            
            // Store email for subsequent steps
            setEmail(values.email)
            setCurrentStep(ResetStep.OTP)
            
            toast({
                variant: "default",
                title: "OTP Sent",
                description: "Please check your email for the verification code"
            })
        } catch (error: any) {
            console.error('OTP request error:', error)
            
            handleApiError(error, "Failed to send verification code")
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Verify OTP provided by user
     */
    const handleVerifyOTP = async (values: z.infer<typeof otpSchema>) => {
        setIsLoading(true)
        try {
            const response = await axiosInstance.post("/customers/validate-otp", {
                email: email,
                otp: values.otp
            })
            
            // Store token for password reset
            setToken(response.data.token)
            setCurrentStep(ResetStep.NEW_PASSWORD)
            
            toast({
                variant: "default",
                title: "OTP Verified",
                description: "Please set your new password"
            })
        } catch (error: any) {
            console.error('OTP verification error:', error)
            
            handleApiError(error, "Invalid OTP. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Reset password with new credentials
     */
    const handleResetPassword = async (values: z.infer<typeof newPasswordSchema>) => {
        setIsLoading(true)
        try {
            await axiosInstance.post("/customers/new-password", {
                email: email,
                token: token,
                password: values.password // Must match backend DTO field name
            })
            
            setCurrentStep(ResetStep.COMPLETE)
            
            toast({
                variant: "default",
                title: "Password Reset Successful",
                description: "You can now log in with your new password"
            })
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                window.location.href = "/login"
            }, 3000)
        } catch (error: any) {
            console.error('Password reset error:', error)
            
            handleApiError(error, "Failed to reset password. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Centralized API error handling
     */
    const handleApiError = (error: any, defaultMessage: string) => {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<any>
            if (axiosError.response?.data) {
                setErrorMessage(axiosError.response.data.message || defaultMessage)
            } else {
                setErrorMessage("An error occurred. Please try again later.")
            }
        } else {
            setErrorMessage("An error occurred. Please try again later.")
        }
    }

    /**
     * Get step description based on current step
     */
    const getStepDescription = () => {
        switch(currentStep) {
            case ResetStep.EMAIL:
                return "Enter your email to receive a verification code";
            case ResetStep.OTP:
                return "Enter the verification code sent to your email";
            case ResetStep.NEW_PASSWORD:
                return "Create a new password";
            case ResetStep.COMPLETE:
                return "Password reset successful";
        }
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Reset Password</CardTitle>
                        <CardDescription>{getStepDescription()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Email Input Step */}
                        {currentStep === ResetStep.EMAIL && (
                            <Form {...emailForm}>
                                <form onSubmit={emailForm.handleSubmit(handleSendOTP)} className="space-y-4">
                                    <FormField
                                        control={emailForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="name@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? "Sending..." : "Send Verification Code"}
                                    </Button>
                                    <div className="text-center">
                                        <Button variant="link" className="p-0" onClick={() => window.location.href = "/login"}>
                                            Back to Login
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        )}

                        {/* OTP Verification Step */}
                        {currentStep === ResetStep.OTP && (
                            <Form {...otpForm}>
                                <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-4">
                                    <FormField
                                        control={otpForm.control}
                                        name="otp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Verification Code</FormLabel>
                                                <FormControl>
                                                    <OTPInput
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        length={6}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? "Verifying..." : "Verify Code"}
                                    </Button>
                                    <div className="text-center">
                                        <Button 
                                            variant="link" 
                                            className="p-0" 
                                            onClick={() => setCurrentStep(ResetStep.EMAIL)}
                                        >
                                            Back
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        )}

                        {/* New Password Step */}
                        {currentStep === ResetStep.NEW_PASSWORD && (
                            <Form {...passwordForm}>
                                <form onSubmit={passwordForm.handleSubmit(handleResetPassword)} className="space-y-4">
                                    <FormField
                                        control={passwordForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Password must be at least 8 characters and include lowercase, uppercase, 
                                                    number, and special character.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={passwordForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? "Resetting..." : "Reset Password"}
                                    </Button>
                                </form>
                            </Form>
                        )}

                        {/* Completion Step */}
                        {currentStep === ResetStep.COMPLETE && (
                            <div className="text-center space-y-4">
                                <p>Your password has been reset successfully.</p>
                                <p>You will be redirected to login shortly...</p>
                                <Button 
                                    className="w-full" 
                                    onClick={() => window.location.href = "/login"}
                                >
                                    Go to Login
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ResetPasswordPage