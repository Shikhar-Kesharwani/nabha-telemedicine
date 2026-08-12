
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Video, VideoOff, PhoneOff, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';


const mockPatients = {
    p1: { name: 'Rajesh Kumar', avatar: 'https://picsum.photos/seed/patient1/100/100', dataAiHint: 'man portrait' },
    p2: { name: 'Priya Sharma', avatar: 'https://picsum.photos/seed/patient2/100/100', dataAiHint: 'woman portrait' },
    p3: { name: 'Amarjit Singh', avatar: 'https://picsum.photos/seed/patient3/100/100', dataAiHint: 'senior man' },
    emergency: { name: 'Emergency Patient', avatar: 'https://picsum.photos/seed/patient4/100/100', dataAiHint: 'person urgent' }
};
type Patient = (typeof mockPatients)['p1'];


function VideoCallComponent() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as keyof typeof mockPatients;
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const doctorImage = PlaceHolderImages.find(img => img.id === 'doctor-2');

  useEffect(() => {
    if (!patientId) return;
    setPatient(mockPatients[patientId] || mockPatients.emergency);
  }, [patientId]);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera and microphone permissions in your browser settings.',
        });
      }
    };

    getCameraPermission();

    return () => {
      // Cleanup: stop media tracks when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const toggleMic = () => {
     if(videoRef.current?.srcObject){
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getAudioTracks().forEach(track => track.enabled = !isMicOn);
        setIsMicOn(!isMicOn);
     }
  };

  const toggleCamera = () => {
    if(videoRef.current?.srcObject){
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getVideoTracks().forEach(track => track.enabled = !isCameraOn);
        setIsCameraOn(!isCameraOn);
     }
  };
  
  const handleEndCall = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
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
    <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center mb-4">
             <Button variant="ghost" size="icon" className="mr-2" asChild>
                <Link href="/doctor/dashboard"><ArrowLeft /></Link>
            </Button>
            <Avatar className="h-10 w-10">
                <AvatarImage src={patient.avatar} alt={patient.name} />
                <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
                <p className="font-semibold">{patient.name}</p>
                <p className="text-sm text-muted-foreground">Video Call in Progress</p>
            </div>
        </div>

      <div className="flex-grow grid md:grid-cols-2 gap-4">
        {/* Patient's Video Placeholder */}
        <Card className="flex flex-col">
          <CardContent className="p-2 flex-grow relative bg-secondary flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                 <Avatar className="h-32 w-32">
                    <AvatarImage src={patient.avatar} alt={patient.name} />
                    <AvatarFallback className="text-4xl">{patient.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="text-muted-foreground">Connecting to {patient.name}...</p>
            </div>
             <div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 rounded-md">
              {patient.name}
            </div>
          </CardContent>
        </Card>

        {/* Doctor's Video */}
        <Card className="flex flex-col">
          <CardContent className="p-2 flex-grow relative">
            <video ref={videoRef} className="w-full h-full object-cover rounded-md bg-secondary" autoPlay muted playsInline />
            {!isCameraOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary rounded-md">
                    <VideoOff className="w-16 h-16 text-muted-foreground" />
                </div>
            )}
             <div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 rounded-md">
              You (Doctor)
            </div>
          </CardContent>
        </Card>
      </div>

       {hasCameraPermission === false && (
         <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Camera & Microphone Access Required</AlertTitle>
            <AlertDescription>
                Please allow camera and microphone access in your browser settings to use the video call feature. You may need to refresh the page after granting permissions.
            </AlertDescription>
          </Alert>
       )}

      {/* Controls */}
      <div className="flex justify-center items-center gap-4 mt-4 p-4 bg-background rounded-lg border">
        <Button
          variant={isMicOn ? 'outline' : 'secondary'}
          size="icon"
          onClick={toggleMic}
          className="h-14 w-14 rounded-full"
          disabled={!hasCameraPermission}
        >
          {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>
        <Button
          variant={isCameraOn ? 'outline' : 'secondary'}
          size="icon"
          onClick={toggleCamera}
          className="h-14 w-14 rounded-full"
          disabled={!hasCameraPermission}
        >
          {isCameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
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

export default function VideoCallPage() {
    return (
        <VideoCallComponent />
    )
}
