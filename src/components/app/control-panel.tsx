'use client';

import { useState, type FC, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, Sparkles, LoaderCircle, Mic, MicOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

interface Preset {
  id: string;
  label: string;
  description: string;
}

interface ControlPanelProps {
  presets: Preset[];
}

// Extend window type for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

function SubmitButton({ imageSelected }: { imageSelected: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending || !imageSelected}>
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Model
        </>
      )}
    </Button>
  );
}

const ControlPanel: FC<ControlPanelProps> = ({ presets }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('en-US'); // 'en-US' for English, 'kn-IN' for Kannada
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

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
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    } else {
        toast({
            variant: "destructive",
            title: "Browser Not Supported",
            description: "Your browser does not support voice input.",
        });
    }
  }, [language, toast]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
        <CardDescription>Upload an image and guide the generation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="image-upload">Upload Image</Label>
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
                  <span>Click or drag to upload</span>
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
            />
          </div>
        </div>

        <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="prompt">Custom Prompt (Optional)</Label>
              <Button variant="ghost" size="icon" onClick={toggleListening} className="h-8 w-8">
                {isListening ? <MicOff className="text-destructive" /> : <Mic />}
              </Button>
            </div>
            <Textarea
              id="prompt"
              name="prompt"
              placeholder="e.g., 'a futuristic version of the object', 'make it look like it is made of wood'"
              className="min-h-[80px]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-muted-foreground">Language:</span>
                <Button
                    variant={language === 'en-US' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setLanguage('en-US')}
                >
                    EN
                </Button>
                <Button
                    variant={language === 'kn-IN' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setLanguage('kn-IN')}
                >
                    KN
                </Button>
            </div>
        </div>

        <div className="space-y-4">
          <Label>Style Preset</Label>
          <RadioGroup name="style" defaultValue={presets[0].id} className="space-y-1">
            {presets.map((preset) => (
              <Label
                key={preset.id}
                htmlFor={preset.id}
                className="flex cursor-pointer items-start space-x-3 rounded-md border p-4 transition-colors hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:bg-accent [&:has([data-state=checked])]:text-accent-foreground"
              >
                <RadioGroupItem value={preset.id} id={preset.id} className="mt-0.5" />
                <div className="grid gap-1.5">
                  <span className="font-semibold">{preset.label}</span>
                  <span className="text-sm text-muted-foreground">{preset.description}</span>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter>
        <SubmitButton imageSelected={!!imagePreview} />
      </CardFooter>
    </Card>
  );
};

export default ControlPanel;
