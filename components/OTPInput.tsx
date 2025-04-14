"use client"
import React, { useState, useRef, useEffect } from 'react'
import { Input } from "@/components/ui/input"

interface OTPInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ 
    length = 6, 
    value = '',
    onChange
}) => {
    const [otp, setOtp] = useState<string[]>(value.split('').concat(Array(length - value.length).fill('')))
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, length)
    }, [length])

    useEffect(() => {
        // Initialize with the value if provided
        if (value) {
            const valueArray = value.split('').concat(Array(length - value.length).fill(''))
            setOtp(valueArray)
        }
    }, [value, length])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const val = e.target.value
        
        // Only allow digits
        if (val && !/^\d+$/.test(val)) return
        
        // Take only the last character if pasted content is longer
        const newVal = val.slice(-1)
        
        // Create a copy of the current OTP array
        const newOtp = [...otp]
        newOtp[index] = newVal
        
        // Update the OTP state
        setOtp(newOtp)
        
        // Notify parent component about the change
        onChange(newOtp.join(''))
        
        // Move to the next input if available
        if (newVal && index < length - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            // Move to previous input on backspace when current input is empty
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text/plain').trim()
        
        // Only allow digits
        if (!/^\d+$/.test(pastedData)) return
        
        // Take only up to the required length
        const pastedArray = pastedData.slice(0, length).split('')
        
        const newOtp = [...otp]
        pastedArray.forEach((char, idx) => {
            if (idx < length) newOtp[idx] = char
        })
        
        setOtp(newOtp)
        onChange(newOtp.join(''))
        
        // Focus last input or the next empty one
        const focusIndex = Math.min(pastedArray.length, length - 1)
        inputRefs.current[focusIndex]?.focus()
    }

    return (
        <div className="flex gap-2 justify-between">
            {Array.from({ length }, (_, index) => (
                <Input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[index] || ''}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="w-12 h-12 text-center text-lg"
                    autoComplete="one-time-code"
                />
            ))}
        </div>
    )
}

export default OTPInput
