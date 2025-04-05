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
import { Label } from '@/components/ui/label'
import axios, { AxiosError } from 'axios'
import { useToast } from "@/hooks/use-toast"
import { z } from 'zod'
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { UUID } from 'crypto'
import { ErrorResponse } from '../types/diary'
import { AuthResponse } from '../types/diary'
import axiosInstance from '@/apiConfig'
import useAuthStore from '@/hooks/useAuthStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
    email: z.string().email({
        message: "Email not valid"
    }),
    password: z.string().min(8, { message: "Password not valid" })
})

const page = () => {
    const setAuth = useAuthStore((state) => state.setAuthTokens)
    const [errorMessage, setErrorMessage] = useState<string | any>()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { toast } = useToast()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    useEffect(() => {
        if (errorMessage != null) {
            console.log(errorMessage)
            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage
            })
        }
    }, [errorMessage])

    const handleLogin = async (values: z.infer<typeof formSchema>) => {
        const email = values.email
        const password = values.password
        setIsLoading(true)
        try {
            const response = await axiosInstance.post<AuthResponse>("/auth/login", {
                email,
                password
            })

            setAuth(response.data.userId, response.data.accessToken, response.data.refreshToken);

            toast({
                variant: "default",
                title: "Login Success",
            })

            window.location.href = "/diary"
        } catch (error: any) {
            console.error('Sign in error:', error);

            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ErrorResponse>;
                if (axiosError.response?.data && axiosError.response.status === 401) {
                    console.log(axiosError.response?.data.message)
                    setErrorMessage("Invalid email or password");
                } else {
                    setErrorMessage("An error occurred. Please try again later.");
                }
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
                            <form onSubmit={form.handleSubmit(handleLogin)}>
                                <div className="grid gap-6">
                                    <div className="flex flex-col gap-4">
                                        <Button variant="outline" className="w-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2">
                                                <path
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                    fill="#4285F4"
                                                />
                                                <path
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                    fill="#34A853"
                                                />
                                                <path
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                    fill="#FBBC05"
                                                />
                                                <path
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                    fill="#EA4335"
                                                />
                                            </svg>
                                            Login with Google
                                        </Button>
                                        <Button variant="outline" className="w-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2">
                                                <path
                                                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                                                    fill="#1877F2"
                                                />
                                                <path
                                                    d="M16.671 15.073l.532-3.47h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.513V4.526s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.672H7.078v3.47h3.047v8.385a12.137 12.137 0 003.75 0v-8.385h2.796z"
                                                    fill="#FFFFFF"
                                                />
                                            </svg>
                                            Login with Facebook
                                        </Button>
                                    </div>
                                    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                                        <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
                                    </div>
                                    <div className="grid gap-6">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="youremail@example.com" {...field} />
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
                                                    <div className="flex items-center">
                                                        <FormLabel>Password</FormLabel>
                                                        <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                                                            Forgot your password?
                                                        </a>
                                                    </div>
                                                    <FormControl>
                                                        <Input type="password" placeholder="********" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? "Logging in..." : "Login"}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
                <div className="text-center">
                    <p>Don't have an account? <a href='/signup' className='text-primary underline-offset-4 hover:underline'>Sign Up</a></p>
                </div>
                <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
                    By clicking login, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                </div>
            </div>
        </div>
    )
}

export default page