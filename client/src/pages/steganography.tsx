import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FileDropzone } from "@/components/file-dropzone";
import { encodeMessage, decodeMessage, calculateCapacity } from "@/lib/steganography";
import { Download, Upload, Lock, Unlock, Copy, FileImage, MessageSquare } from "lucide-react";

export default function SteganographyPage() {
  const { toast } = useToast();
  
  // Encode state
  const [encodeFile, setEncodeFile] = useState<File | null>(null);
  const [secretMessage, setSecretMessage] = useState("");
  const [encodePassword, setEncodePassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [isEncoding, setIsEncoding] = useState(false);
  const [encodeProgress, setEncodeProgress] = useState(0);
  const [encodedImageUrl, setEncodedImageUrl] = useState<string | null>(null);
  
  // Decode state
  const [decodeFile, setDecodeFile] = useState<File | null>(null);
  const [decodePassword, setDecodePassword] = useState("");
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodeProgress, setDecodeProgress] = useState(0);
  const [decodedMessage, setDecodedMessage] = useState("");
  const [decodeSuccess, setDecodeSuccess] = useState<boolean | null>(null);
  
  const downloadRef = useRef<HTMLAnchorElement>(null);
  
  const handleEncodeFileSelect = useCallback((file: File) => {
    setEncodeFile(file);
    setEncodedImageUrl(null);
  }, []);
  
  const handleDecodeFileSelect = useCallback((file: File) => {
    setDecodeFile(file);
    setDecodedMessage("");
    setDecodeSuccess(null);
  }, []);
  
  const calculateMessageCapacity = useCallback((file: File | null) => {
    if (!file) return "Calculating...";
    
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const capacity = calculateCapacity(img.width, img.height);
        resolve(`${capacity.toLocaleString()} characters`);
      };
      img.src = URL.createObjectURL(file);
    });
  }, []);
  
  const handleEncode = async () => {
    if (!encodeFile || !secretMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select an image and enter a message to encode.",
        variant: "destructive",
      });
      return;
    }
    
    if (usePassword && !encodePassword.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter a password for protection.",
        variant: "destructive",
      });
      return;
    }
    
    setIsEncoding(true);
    setEncodeProgress(0);
    
    try {
      const progressCallback = (progress: number) => {
        setEncodeProgress(progress);
      };
      
      const encodedBlob = await encodeMessage(
        encodeFile,
        secretMessage,
        usePassword ? encodePassword : undefined,
        progressCallback
      );
      
      const url = URL.createObjectURL(encodedBlob);
      setEncodedImageUrl(url);
      
      toast({
        title: "Encoding Successful",
        description: "Your message has been hidden in the image. You can now download it.",
      });
    } catch (error) {
      console.error("Encoding error:", error);
      toast({
        title: "Encoding Failed",
        description: "Failed to encode the message. Please try with a different image.",
        variant: "destructive",
      });
    } finally {
      setIsEncoding(false);
      setEncodeProgress(0);
    }
  };
  
  const handleDecode = async () => {
    if (!decodeFile) {
      toast({
        title: "No Image Selected",
        description: "Please select an image to decode.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDecoding(true);
    setDecodeProgress(0);
    setDecodedMessage("");
    setDecodeSuccess(null);
    
    try {
      const progressCallback = (progress: number) => {
        setDecodeProgress(progress);
      };
      
      const message = await decodeMessage(
        decodeFile,
        decodePassword || undefined,
        progressCallback
      );
      
      if (message) {
        setDecodedMessage(message);
        setDecodeSuccess(true);
        toast({
          title: "Message Extracted",
          description: "The hidden message has been successfully extracted.",
        });
      } else {
        setDecodeSuccess(false);
        toast({
          title: "No Message Found",
          description: "This image may not contain a hidden message or the password is incorrect.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Decoding error:", error);
      setDecodeSuccess(false);
      toast({
        title: "Decoding Failed",
        description: "Failed to decode the message. Please check the image and password.",
        variant: "destructive",
      });
    } finally {
      setIsDecoding(false);
      setDecodeProgress(0);
    }
  };
  
  const handleDownload = () => {
    if (!encodedImageUrl || !encodeFile) return;
    
    const link = downloadRef.current;
    if (link) {
      link.href = encodedImageUrl;
      link.download = `encoded_${encodeFile.name}`;
      link.click();
    }
  };
  
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(decodedMessage);
      toast({
        title: "Copied",
        description: "Message copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy message to clipboard.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-mono font-bold text-lg">S</span>
              </div>
              <h1 className="font-sans font-bold text-xl text-foreground">SteganoTool</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <span className="text-muted-foreground text-sm font-medium">How it Works</span>
              <span className="text-muted-foreground text-sm font-medium">Security</span>
              <span className="text-muted-foreground text-sm font-medium">Help</span>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="bg-background py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-sans font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-6">
              Hide Messages in Images
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Secure steganography tool for embedding secret text messages within images using LSB (Least Significant Bit) encryption. 
              Upload, encode, decode - all processed locally in your browser for maximum privacy.
            </p>
          </div>
        </div>
      </section>
      
      {/* Main Tool */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Encode Panel */}
          <Card className="bg-card border-border">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-sans font-semibold text-xl text-card-foreground">Encode Message</h3>
                <span className="bg-primary/10 text-primary px-2 py-1 text-xs font-mono font-medium">HIDE</span>
              </div>
              
              {/* Image Upload */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-card-foreground mb-2 block">Cover Image</Label>
                <FileDropzone
                  onFileSelect={handleEncodeFileSelect}
                  accept="image/png,image/jpeg"
                  maxSize={10 * 1024 * 1024}
                  icon={<FileImage className="w-6 h-6 text-primary" />}
                  title="Drop image here or click to browse"
                  subtitle="PNG, JPEG up to 10MB"
                  file={encodeFile}
                  data-testid="encode-dropzone"
                />
              </div>
              
              {/* Message Input */}
              <div className="mb-6">
                <Label htmlFor="secret-message" className="text-sm font-medium text-card-foreground mb-2 block">
                  Secret Message
                </Label>
                <Textarea
                  id="secret-message"
                  value={secretMessage}
                  onChange={(e) => setSecretMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                  placeholder="Enter your secret message here..."
                  data-testid="input-secret-message"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {secretMessage.length} characters
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {encodeFile ? `Capacity: ${Math.floor(calculateCapacity(1920, 1080))} chars` : 'Capacity: Select image'}
                  </span>
                </div>
              </div>
              
              {/* Password Protection */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-card-foreground mb-3 block">Encoding Options</Label>
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    id="password-protect"
                    checked={usePassword}
                    onCheckedChange={(checked) => setUsePassword(!!checked)}
                    data-testid="checkbox-password-protect"
                  />
                  <Label htmlFor="password-protect" className="text-sm text-card-foreground">
                    Password Protection
                  </Label>
                </div>
                {usePassword && (
                  <Input
                    type="password"
                    value={encodePassword}
                    onChange={(e) => setEncodePassword(e.target.value)}
                    placeholder="Enter password"
                    className="ml-6"
                    data-testid="input-encode-password"
                  />
                )}
              </div>
              
              {/* Encode Button & Progress */}
              <div className="space-y-4">
                <Button
                  onClick={handleEncode}
                  disabled={isEncoding || !encodeFile || !secretMessage.trim()}
                  className="w-full bg-primary text-primary-foreground hover:opacity-90"
                  data-testid="button-encode"
                >
                  {isEncoding ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      Encoding...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Encode Message
                    </>
                  )}
                </Button>
                
                {isEncoding && (
                  <div className="space-y-2" data-testid="encode-progress">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Encoding...</span>
                      <span>{Math.round(encodeProgress)}%</span>
                    </div>
                    <Progress value={encodeProgress} className="w-full" />
                  </div>
                )}
                
                {encodedImageUrl && (
                  <div className="bg-primary/10 border border-primary/20 p-4 fade-in" data-testid="encode-result">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-primary font-medium">Message Encoded Successfully!</p>
                        <p className="text-sm text-muted-foreground mt-1">Your steganographic image is ready for download</p>
                      </div>
                      <Button
                        onClick={handleDownload}
                        size="sm"
                        className="bg-primary text-primary-foreground hover:opacity-90"
                        data-testid="button-download"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Decode Panel */}
          <Card className="bg-card border-border">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-sans font-semibold text-xl text-card-foreground">Decode Message</h3>
                <span className="bg-accent/50 text-accent-foreground px-2 py-1 text-xs font-mono font-medium">EXTRACT</span>
              </div>
              
              {/* Image Upload */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-card-foreground mb-2 block">Steganographic Image</Label>
                <FileDropzone
                  onFileSelect={handleDecodeFileSelect}
                  accept="image/png,image/jpeg"
                  maxSize={10 * 1024 * 1024}
                  icon={<Unlock className="w-6 h-6 text-accent-foreground" />}
                  title="Drop steganographic image here"
                  subtitle="PNG, JPEG with hidden messages"
                  file={decodeFile}
                  data-testid="decode-dropzone"
                />
              </div>
              
              {/* Password Input */}
              <div className="mb-6">
                <Label htmlFor="decode-password" className="text-sm font-medium text-card-foreground mb-2 block">
                  Password (if protected)
                </Label>
                <Input
                  id="decode-password"
                  type="password"
                  value={decodePassword}
                  onChange={(e) => setDecodePassword(e.target.value)}
                  placeholder="Enter password if message is protected"
                  data-testid="input-decode-password"
                />
              </div>
              
              {/* Decode Button & Progress */}
              <div className="space-y-4 mb-6">
                <Button
                  onClick={handleDecode}
                  disabled={isDecoding || !decodeFile}
                  className="w-full bg-secondary text-secondary-foreground hover:opacity-90"
                  data-testid="button-decode"
                >
                  {isDecoding ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 mr-2" />
                      Extract Message
                    </>
                  )}
                </Button>
                
                {isDecoding && (
                  <div className="space-y-2" data-testid="decode-progress">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Extracting...</span>
                      <span>{Math.round(decodeProgress)}%</span>
                    </div>
                    <Progress value={decodeProgress} className="w-full" />
                  </div>
                )}
              </div>
              
              {/* Decoded Message Display */}
              <div className="mb-4">
                <Label className="text-sm font-medium text-card-foreground mb-2 block">Extracted Message</Label>
                <div className="min-h-[120px] p-4 border border-border bg-muted/30">
                  {!decodedMessage ? (
                    <div className="text-center text-muted-foreground py-8" data-testid="decoded-message-placeholder">
                      <div className="w-8 h-8 bg-muted mx-auto mb-2 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm">Decoded message will appear here</p>
                    </div>
                  ) : (
                    <div data-testid="decoded-message-content">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono text-muted-foreground">EXTRACTED MESSAGE</span>
                        <Button
                          onClick={handleCopyMessage}
                          variant="ghost"
                          size="sm"
                          className="text-xs text-primary hover:text-primary/80"
                          data-testid="button-copy-message"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <p className="text-card-foreground leading-relaxed font-mono text-sm" data-testid="text-decoded-message">
                        {decodedMessage}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Decode Result */}
              {decodeSuccess !== null && (
                <div className="fade-in" data-testid="decode-result">
                  {decodeSuccess ? (
                    <div className="bg-primary/10 border border-primary/20 p-4">
                      <p className="text-primary font-medium">Message Extracted Successfully!</p>
                      <p className="text-sm text-muted-foreground mt-1">The hidden message has been revealed above</p>
                    </div>
                  ) : (
                    <div className="bg-destructive/10 border border-destructive/20 p-4">
                      <p className="text-destructive font-medium">No Message Found</p>
                      <p className="text-sm text-muted-foreground mt-1">This image may not contain a hidden message or the password is incorrect</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Info Section */}
      <section className="bg-muted py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="font-sans font-bold text-2xl sm:text-3xl text-foreground mb-4">How Steganography Works</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our tool uses LSB (Least Significant Bit) steganography to hide messages in the least noticeable parts of image data
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <FileImage className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-sans font-semibold text-lg text-foreground mb-2">Image Analysis</h4>
              <p className="text-muted-foreground text-sm">The algorithm analyzes pixel data to determine encoding capacity and optimal bit placement</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-sans font-semibold text-lg text-foreground mb-2">Bit Manipulation</h4>
              <p className="text-muted-foreground text-sm">Text is converted to binary and embedded into the least significant bits of pixel color values</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <Unlock className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-sans font-semibold text-lg text-foreground mb-2">Invisible Changes</h4>
              <p className="text-muted-foreground text-sm">Modifications are imperceptible to the human eye while preserving the hidden message</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Technical Details */}
      <section className="bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-card border-border">
            <CardContent className="p-6 sm:p-8">
              <h3 className="font-sans font-semibold text-xl text-card-foreground mb-6">Technical Specifications</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-card-foreground mb-3">Supported Formats</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <span className="font-mono text-xs bg-muted px-2 py-1 mr-2">PNG</span> 
                      Lossless compression (recommended)
                    </li>
                    <li className="flex items-center">
                      <span className="font-mono text-xs bg-muted px-2 py-1 mr-2">JPEG</span> 
                      Lossy compression (limited capacity)
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-card-foreground mb-3">Security Features</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Client-side processing only</li>
                    <li>• Optional password protection</li>
                    <li>• LSB encryption algorithm</li>
                    <li>• No data transmitted to servers</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted border border-border">
                <h4 className="font-medium text-card-foreground mb-2">Capacity Estimation</h4>
                <p className="text-sm text-muted-foreground">
                  <span className="font-mono">Capacity ≈ (width × height × 3 bits) / 8 characters</span><br />
                  Example: A 1920×1080 image can hide approximately 777,600 characters
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-mono font-bold text-sm">S</span>
              </div>
              <span className="font-sans font-semibold">SteganoTool</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-secondary-foreground/70">© 2024 SteganoTool</span>
              <span className="text-secondary-foreground/70">Privacy</span>
              <span className="text-secondary-foreground/70">Terms</span>
              <span className="text-secondary-foreground/70">GitHub</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Hidden download link */}
      <a ref={downloadRef} className="hidden" download />
    </div>
  );
}
