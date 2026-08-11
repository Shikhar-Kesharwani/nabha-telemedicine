
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, PhoneOff, AlertTriangle, User, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

const mockPatients = {
    s1: { name: 'Gurdeep Kaur', avatar: 'https://picsum.photos/seed/patient5/100/100', dataAiHint: 'woman portrait' },
    s2: { name: 'Suresh Patel', avatar: 'https://picsum.photos/seed/patient6/100/100', dataAiHint: 'man smiling' },
    s3: { name: 'Manjit Singh', avatar: 'https://picsum.photos/seed/patient7/100/100', dataAiHint: 'senior man portrait' },
};
type Patient = (typeof mockPatients)['s1'];


function VoiceCallComponent() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as keyof typeof mockPatients;
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  
  const doctorImage = PlaceHolderImages.find(img => img.id === 'doctor-2');

  useEffect(() => {
    if (!patientId) return;
    setPatient(mockPatients[patientId] || null);
  }, [patientId]);


  useEffect(() => {
    let stream: MediaStream | null = null;
    const getMicPermission = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicPermission(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setHasMicPermission(false);
        toast({
          variant: 'destructive',
          title: 'Microphone Access Denied',
          description: 'Please enable microphone permissions in your browser settings.',
        });
      }
    };

    getMicPermission();
    
    return () => {
        stream?.getTracks().forEach(track => track.stop());
    };
  }, [toast]);

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };
  
  const handleEndCall = () => {
    toast({
        title: "Call Ended",
        description: `Your call with ${patient?.name || 'the patient'} has ended.`,
    });
    router.push('/doctor/dashboard');
  }

  if (!patient) {
     return (
        <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center">
            <Skeleton className="h-12 w-12 rounded-full mb-4" />
            <Skeleton className="h-4 w-[250px] mb-2" />
            <Skeleton className="h-4 w-[200px]" />
        </div>
     )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] items-center justify-center">
       <div className="w-full max-w-md mb-4">
         <Button variant="ghost" asChild>
            <Link href="/doctor/dashboard" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
        </Button>
      </div>

      <Card className="w-full max-w-md">
        <CardContent className="p-8 flex flex-col items-center gap-6">
            <div className="text-center">
                <p className="text-muted-foreground">Voice Call with</p>
                <h1 className="text-3xl font-bold">{patient.name}</h1>
                <p className="mt-4 text-lg text-muted-foreground animate-pulse">Connecting...</p>
            </div>
          
            <div className="flex items-center justify-center gap-12">
                 <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={doctorImage?.imageUrl} data-ai-hint={doctorImage?.imageHint} />
                        <AvatarFallback>DR</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold">You (Doctor)</p>
                 </div>
                 <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={patient.avatar} data-ai-hint={patient.dataAiHint} />
                        <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                    <p className="font-semibold">{patient.name}</p>
                 </div>
            </div>
          
        </CardContent>
      </Card>

       {hasMicPermission === false && (
         <Alert variant="destructive" className="mt-4 max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Microphone Access Required</AlertTitle>
            <AlertDescription>
                Please allow microphone access in your browser settings to use the voice call feature.
            </AlertDescription>
          </Alert>
       )}

      {/* Controls */}
      <div className="flex justify-center items-center gap-4 mt-8 p-4 bg-background rounded-lg border">
        <Button
          variant={isMicOn ? 'outline' : 'secondary'}
          size="icon"
          onClick={toggleMic}
          className="h-14 w-14 rounded-full"
          disabled={!hasMicPermission}
        >
          {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>
         <Button
          variant="destructive"
          size="icon"
          onClick={handleEndCall}
          className="h-14 w-14 rounded-full"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

export default function VoiceCallPage() {
    return (
        <VoiceCallComponent />
    )
}
