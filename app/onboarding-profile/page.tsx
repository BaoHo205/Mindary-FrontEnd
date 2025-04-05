"use client"
import React, { useState, useRef, useEffect } from 'react'
import type { NextPage } from 'next'
import OnboardingStep from '@/components/onboarding-profile/OnboardingStep'
import { Button } from '@/components/ui/button'
import OnboardingProgress from '@/components/onboarding-profile/OnboardingProgress'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import WheelPicker from '@/components/general/WheelPicker'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check } from 'lucide-react'
import SelectPreferTime from '@/components/onboarding-profile/SelectPreferTime'
import SelectPreferName from '@/components/onboarding-profile/SelectPreferName'
import SelectPreferGender from '@/components/onboarding-profile/SelectPreferGender'
import SelectAge from '@/components/onboarding-profile/SelectAge'
import SelectPreferActivities from '@/components/onboarding-profile/SelectPreferActivities'
import axios, { AxiosError } from 'axios'
import { useAtomValue } from 'jotai'
import { ErrorResponse } from '../types/diary'
import axiosInstance from '@/apiConfig'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export interface ActivityType {
    label: string;
    description: string;
    options: string[];
    selected: boolean;
}

interface CustomerPreference {
    nickName: string,
    gender: string,
    age: string,
    reminderTime: string
}

const OnboadringProfile: NextPage = () => {
    const [currentStep, setCurrentStep] = useState(1)
    const [nickname, setNickname] = useState('')
    const [gender, setGender] = useState('')
    const [age, setAge] = useState('25')
    const [selectedActivities, setSelectedActivities] = useState<ActivityType[]>([
        {
            label: "Emotions",
            description: "Happy, Sad, Angry, Anxious, Excited, Cal...",
            options: ["Happy", "Sad", "Angry", "Anxious", "Excited", "Calm"],
            selected: false,
        },
        {
            label: "Work",
            description: "Overtime, Teamwork, Meeting, Deadline...",
            options: ["Overtime", "Teamwork", "Meeting", "Deadline"],
            selected: false,
        },
        {
            label: "School",
            description: "Classes, Homework, Exams, Projects, Lect...",
            options: ["Classes", "Homework", "Exams", "Projects", "Lecture"],
            selected: false,
        },
        {
            label: "Health",
            description: "Exercise, Doctor Visit, Medication, Therap...",
            options: ["Exercise", "Doctor Visit", "Medication", "Therapy"],
            selected: false,
        },
        {
            label: "Relationships",
            description: "Date Night, Quality Time, Conflict, Support, Co...",
            options: ["Date Night", "Quality Time", "Conflict", "Support"],
            selected: false,
        },
    ]);
    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
    const [reminderHour, setReminderHour] = useState<string>(hours[0]);
    const [reminderMinute, setReminderMinute] = useState<string>(minutes[0]);
    const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // const userId = useAtomValue(userIdAtom);
    // const accessToken = useAtomValue(accessTokenAtom);
    const [progress, setProgress] = useState(0);

    const totalSteps = 5

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (!nickname) {
                setError("Please enter your nickname")
                return
            } else {
                setError(null)
            }
        }

        if (currentStep === 2) {
            if (!gender) {
                setError("Please choose your prefer gender")
                return
            } else {
                setError(null)
            }
        }

        setCurrentStep(currentStep + 1)
    }

    const handleBackStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    useEffect(() => {
        console.log(gender)
    }, [gender])

    const handleSubmit = async () => {
        setCurrentStep(currentStep + 1)
        setIsLoading(true)
        try {
            // const response = await axiosInstance.patch(`/customers/${userId}`,
            //     {
            //         "nickname": nickname,
            //         "gender": gender,
            //         "age": age,
            //         "hour": parseInt(reminderHour),
            //         "minute": parseInt(reminderMinute),
            //         "ampm": ampm
            //     },
            //     {
            //         headers: {
            //             "Authorization": `Bearer ${accessToken}`
            //         },
            //         onDownloadProgress: (progressEvent) => {
            //             const percentCompledted = Math.round(
            //                 (progressEvent.loaded * 100) / (progressEvent.total || 1000)
            //             )
            //             setProgress(percentCompledted)
            //         }
            //     },
            // )

            // if (response.status === 200) {
            //     console.log("success")
            // }

            // setProgress(100)
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ErrorResponse>
                if (axiosError.response?.data) {
                    console.log(axiosError.response.data.message)
                }
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="py-2 h-screen flex flex-col">
            {currentStep <= totalSteps ?
                <div className="flex w-full justify-between items-center mb-4">
                    <Button variant="ghost" onClick={handleBackStep} disabled={currentStep === 1}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </Button>
                    <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
                </div> :
                <div></div>
            }


            {currentStep === 1 && (
                <SelectPreferName
                    title='What should we call you?'
                    description='First things first, enter your nickname'
                    nickname={nickname}
                    setNickname={setNickname}
                    error={error}
                />
            )}

            {currentStep === 2 && (
                <SelectPreferGender
                    title='What is your gender?'
                    description='Help us tailor your experience'
                    gender={gender}
                    setGender={setGender}
                    error={error}
                />
            )}

            {currentStep === 3 && (
                <SelectAge title="How old are you?" description="We'd like to know more about you" age={age} setAge={setAge} />
            )}

            {currentStep === 4 && (
                <SelectPreferActivities title='What do you want to record?' description='Track activities that matter to you. Choose the types of activities you want to log.' selectedActivities={selectedActivities} setSelectedActivities={setSelectedActivities} />
            )}

            {currentStep === 5 && (
                <SelectPreferTime
                    title='Select daily reminder time'
                    description='Stay consistent with your tracking. Choose a time for daily reminders.'
                    reminderHour={reminderHour}
                    setReminderHour={setReminderHour}
                    reminderMinute={reminderMinute}
                    setReminderMinute={setReminderMinute}
                    ampm={ampm}
                    setAmpm={setAmpm}
                />
            )}

            {currentStep > totalSteps && (
                <div className='text-center h-full m-6 flex flex-col justify-evenly'>
                    <div className=''>
                        <h2 className='text-2xl font-bold'>Setting up your personalized page...</h2>
                        <h6 className='mt-4'>Almost ready!</h6>
                    </div>
                    <CircularProgressbar
                        value={progress}
                        text={`${progress}%`}
                        styles={buildStyles({
                            textSize: "20px",
                            pathColor: "#70c2d5",
                            textColor: "#333",
                            trailColor: "#e6e6e6",
                        })}
                    />
                </div>
            )}

            <div className="py-4 px-4 w-full">
                <Button className="w-full" onClick={currentStep < totalSteps ? handleNextStep : handleSubmit}>
                    {currentStep < totalSteps ? "Continue" : "Submit"}
                </Button>
            </div>
        </div>
    )
}

export default OnboadringProfile

