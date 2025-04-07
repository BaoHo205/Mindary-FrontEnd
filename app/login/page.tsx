"use client"
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { z } from 'zod'
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import Link from "next/link"
import axiosInstance from '@/apiConfig'
import useAuthStore from '@/hooks/useAuthStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

const loginSchema = z.object({
    email: z.string().email({
        message: "Email not valid"
    }),
    password: z.string().min(8, { message: "Password not valid" })
})

const page = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { toast } = useToast()
    const setAuthTokens = useAuthStore((state) => state.setAuthTokens)

    // Form setup
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    /**
     * Handle login form submission
     */
    const onSubmit = async (values: z.infer<typeof loginSchema>) => {
        setIsLoading(true)
        try {
            const response = await axiosInstance.post("/auth/login", {
                email: values.email,
                password: values.password
            })

            // Store authentication tokens
            const { userId, accessToken, refreshToken } = response.data
            setAuthTokens(userId, accessToken, refreshToken)

            toast({
                variant: "default",
                title: "Login Successful",
                description: "Welcome back!"
            })

            // Redirect to dashboard
            window.location.href = "/"
        } catch (error: any) {
            console.error('Login error:', error)

            // Handle API errors
            if (error.response?.data?.message) {
                toast({
                    variant: "destructive",
                    title: "Login Failed",
                    description: error.response.data.message
                })
            } else {
                toast({
                    variant: "destructive",
                    title: "Login Failed",
                    description: "Invalid email or password. Please try again."
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Welcome Back</CardTitle>
                        <CardDescription>Let's dive into your account!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="name@example.com" type="email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Password</FormLabel>
                                                <Link href="/reset-password" className="text-sm text-primary hover:underline">
                                                    Forgot password?
                                                </Link>
                                            </div>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Logging in..." : "Login"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Link href="/signup" className="text-primary hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default page