"use client";

import React, { useState, useRef } from "react";
import { Mic, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface VoiceRecorderProps {
    onAudioChange: (audioBlob: Blob | null) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onAudioChange }) => {
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunks.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioBlob(audioBlob);
                setAudioUrl(audioUrl);
                onAudioChange(audioBlob);
            };

            mediaRecorder.start();
            setRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    const deleteRecording = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        onAudioChange(null);
    };

    return (
        <div className="mt-4">
            <Label className=" text-[18px] font-semibold">Voice Memo</Label>

            {audioUrl ? (
                <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg mt-2">
                    <audio controls src={audioUrl} className="w-full" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 text-red-500"
                        onClick={deleteRecording}
                    >
                        <X size={16} />
                    </Button>
                </div>
            ) : (
                <Button
                    onClick={recording ? stopRecording : startRecording}
                    variant="outline"
                    className="flex items-center space-x-2 mt-2 w-full"
                >
                    {recording ? (
                        <>
                            <X size={20} className="text-red-500" />
                            <span>Stop Recording</span>
                        </>
                    ) : (
                        <>
                            <Mic size={20} className="text-primary" />
                            <span>Tap to Record</span>
                        </>
                    )}
                </Button>
            )}
        </div>
    );
};

export default VoiceRecorder;
