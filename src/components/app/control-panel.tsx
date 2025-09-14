'use client';

import { useState, type FC, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, Sparkles, LoaderCircle, Mic, MicOff, Camera, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { Separator } from '../ui/separator';
import type { Language } from '@/app/page';

interface Preset {
  id: string;
  label: string;
  description: string;
}

interface ControlPanelProps {
  presets: Preset[];
  isModelPending: boolean;
  imagePreview: string | null;
  setImagePreview: (value: string | null) => void;
  imageFile: File | null;
  setImageFile: (value: File | null) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: any;
}

// Extend window type for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

function SubmitButton({ imageSelected, isPending, text }: { imageSelected: boolean, isPending: boolean, text: string }) {
  return (
    <Button type="submit" className="w-full" disabled={isPending || !imageSelected}>
      {isPending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          {text}
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          {text}
        </>
      )}
    </Button>
  );
}

const ControlPanel: FC<ControlPanelProps> = ({ 
    presets, 
    isModelPending,
    imagePreview,
    setImagePreview,
    imageFile,
    setImageFile,
    language,
    setLanguage,
    translations
}) => {
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState(language === 'en' ? 'en-US' : 'kn-IN');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setSpeechLanguage(language === 'en' ? 'en-US' : 'kn-IN');
  }, [language]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLanguage;

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setPrompt(prev => prev + finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        let description = 'An unknown error occurred with speech recognition.';
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            description = 'Microphone access was denied. Please allow microphone access in your browser settings.';
        } else if (event.error === 'no-speech') {
            description = 'No speech was detected. Please try again.';
        }
        toast({
            variant: "destructive",
            title: "Voice Input Error",
            description,
        });
        setIsListening(false);
      };

      recognition.onend = () => {
        if (recognitionRef.current) { // Check if it's still mounted
          setIsListening(false);
        }
      };
      
      recognitionRef.current = recognition;
    } else {
        toast({
            variant: "destructive",
            title: "Browser Not Supported",
            description: "Your browser does not support voice input.",
        });
    }

    return () => {
        recognitionRef.current?.abort();
        recognitionRef.current = null;
    }
  }, [speechLanguage, toast]);

  useEffect(() => {
    if (isCameraOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use the camera.',
          });
        }
      };
      getCameraPermission();
    } else {
        // Stop camera stream when modal is closed
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }
  }, [isCameraOpen, toast]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setImageFile(null);
    }
  };
  
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      
      canvas.toBlob((blob) => {
        if (blob) {
            const capturedFile = new File([blob], 'capture.png', { type: 'image/png' });
            setImageFile(capturedFile);
            setImagePreview(canvas.toDataURL('image/png'));
        }
      }, 'image/png');
      
      setIsCameraOpen(false);
    }
  };

  const updateFileInput = () => {
    if (!fileInputRef.current || !imageFile) return;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(imageFile);
    fileInputRef.current.files = dataTransfer.files;
  };
  
  useEffect(() => {
    updateFileInput();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile]);


  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch (error) {
            // This can happen if start() is called again before it has fully stopped.
            console.error("Speech recognition start error:", error);
            setIsListening(false);
        }
      }
    }
  };

  return (
    <>
      <Card className="sticky top-24">
        <CardHeader className="pb-4">
          <CardDescription>{translations.cardDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-full">
              <label
                htmlFor="image-upload"
                className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input bg-secondary/50 p-6 text-center text-sm text-muted-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Image preview"
                    width={200}
                    height={200}
                    className="h-28 w-28 rounded-md object-cover"
                  />
                ) : (
                  <>
                    <UploadCloud className="h-8 w-8" />
                    <span>{translations.uploadLabel}</span>
                  </>
                )}
              </label>
              <input
                id="image-upload"
                name="image"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleImageChange}
                required
                ref={fileInputRef}
              />
            </div>
            <div className="w-full flex items-center gap-2">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">{translations.orSeparator}</span>
                <Separator className="flex-1" />
            </div>
            <Button variant="outline" size="sm" onClick={(e) => { e.preventDefault(); setIsCameraOpen(true); }} className="w-full">
                <Camera className="mr-2" />
                {translations.useCamera}
            </Button>
          </div>

          <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="prompt">{translations.customPromptLabel}</Label>
                <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); toggleListening(); }} className="h-8 w-8">
                  {isListening ? <MicOff className="text-destructive" /> : <Mic />}
                </Button>
              </div>
              <Textarea
                id="prompt"
                name="prompt"
                placeholder={translations.customPromptPlaceholder}
                className="min-h-[80px]"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">{translations.languageLabel}</span>
                  <Button
                      variant={language === 'en' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-7 px-2"
                      onClick={(e) => { e.preventDefault(); setLanguage('en'); }}
                  >
                      EN
                  </Button>
                  <Button
                      variant={language === 'kn' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-7 px-2"
                      onClick={(e) => { e.preventDefault(); setLanguage('kn'); }}
                  >
                      KN
                  </Button>
              </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="style-preset">{translations.stylePresetLabel}</Label>
            <Select name="style" defaultValue={presets[0].id}>
                <SelectTrigger id="style-preset">
                    <SelectValue placeholder={translations.stylePresetPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                    {presets.map((preset) => (
                        <SelectItem key={preset.id} value={preset.id}>
                            <div className="flex flex-col">
                                <span>{preset.label}</span>
                                <span className="text-xs text-muted-foreground">{preset.description}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton imageSelected={!!imagePreview} isPending={isModelPending} text={isModelPending ? translations.generating : translations.generateModel}/>
        </CardFooter>
      </Card>
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{translations.cameraTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative flex items-center justify-center rounded-md border bg-secondary/50">
                <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
                <canvas ref={canvasRef} className="hidden" />
                {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 p-4 text-center">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                        <h3 className="font-semibold">{translations.cameraAccessDenied}</h3>
                        <p className="text-sm text-muted-foreground">{translations.cameraAccessDescription}</p>
                    </div>
                )}
                {hasCameraPermission === null && (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
                     </div>
                )}
            </div>
            {hasCameraPermission === false && (
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{translations.permissionRequired}</AlertTitle>
                    <AlertDescription>
                        {translations.permissionDescription}
                    </AlertDescription>
                </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCameraOpen(false)}>{translations.cancel}</Button>
            <Button onClick={handleCapture} disabled={!hasCameraPermission}>
              <Camera className="mr-2" />
              {translations.capturePhoto}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ControlPanel;
