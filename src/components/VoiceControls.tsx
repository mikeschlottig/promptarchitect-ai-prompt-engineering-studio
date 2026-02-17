import React, { useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
interface VoiceControlsProps {
  onTranscript: (text: string) => void;
}
export function VoiceControls({ onTranscript }: VoiceControlsProps) {
  const isMounted = useRef(true);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();
  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);
  useEffect(() => {
    if (!listening && transcript && isMounted.current) {
      onTranscript(transcript);
      resetTranscript();
      toast.success("Voice input captured");
    }
  }, [listening, transcript, onTranscript, resetTranscript]);
  if (!browserSupportsSpeechRecognition) {
    return null;
  }
  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      if (!isMicrophoneAvailable) {
        toast.error("Microphone access denied or unavailable");
        return;
      }
      resetTranscript();
      SpeechRecognition.startListening({ continuous: false });
    }
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 rounded-full transition-all relative",
        listening ? "bg-red-100 text-red-600 hover:bg-red-200" : "hover:bg-muted"
      )}
      onClick={toggleListening}
      title={listening ? "Stop listening" : "Start voice input"}
    >
      {listening ? (
        <>
          <span className="absolute inset-0 rounded-full animate-ping bg-red-400/30"></span>
          <MicOff className="h-4 w-4 relative z-10" />
        </>
      ) : (
        <Mic className="h-4 w-4" />
      )}
      {listening && (
        <span className="absolute -top-8 right-0 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-50">
          Listening...
        </span>
      )}
    </Button>
  );
}