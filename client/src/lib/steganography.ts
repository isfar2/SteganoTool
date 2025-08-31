// Simple hash function for password-based encoding
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Convert string to binary
function stringToBinary(str: string): string {
  return str.split('').map(char => 
    char.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('');
}

// Convert binary to string
function binaryToString(binary: string): string {
  const chunks = binary.match(/.{1,8}/g) || [];
  return chunks.map(chunk => 
    String.fromCharCode(parseInt(chunk, 2))
  ).join('');
}

// Calculate the capacity of an image for hiding data
export function calculateCapacity(width: number, height: number): number {
  // Each pixel has 3 color channels (RGB), each can hide 1 bit
  // We reserve some bits for metadata (length, delimiter, etc.)
  const totalBits = width * height * 3;
  const metadataBits = 64; // Reserve 64 bits for metadata
  const availableBits = totalBits - metadataBits;
  return Math.floor(availableBits / 8); // Convert to characters
}

// Load image to canvas
function loadImageToCanvas(file: File): Promise<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      resolve({ canvas, ctx });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// Encode message into image using LSB steganography
export async function encodeMessage(
  imageFile: File,
  message: string,
  password?: string,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const { canvas, ctx } = await loadImageToCanvas(imageFile);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Prepare message with metadata
  let fullMessage = message;
  if (password) {
    // Simple XOR encryption with password hash
    const key = simpleHash(password);
    fullMessage = message.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ ((key + i) % 256))
    ).join('');
  }
  
  // Add delimiter to mark end of message
  const delimiter = String.fromCharCode(0, 0, 0, 0); // Four null characters
  const messageWithDelimiter = fullMessage + delimiter;
  const messageBinary = stringToBinary(messageWithDelimiter);
  
  // Check if message fits in image
  const capacity = calculateCapacity(canvas.width, canvas.height);
  if (messageWithDelimiter.length > capacity) {
    throw new Error(`Message too long. Maximum capacity: ${capacity} characters`);
  }
  
  // Encode message length in first 32 bits
  const lengthBinary = message.length.toString(2).padStart(32, '0');
  const fullBinary = lengthBinary + messageBinary;
  
  let binaryIndex = 0;
  const totalPixels = canvas.width * canvas.height;
  
  // Hide binary data in LSBs of RGB channels
  for (let i = 0; i < data.length && binaryIndex < fullBinary.length; i += 4) {
    // Skip alpha channel, only use RGB
    for (let channel = 0; channel < 3 && binaryIndex < fullBinary.length; channel++) {
      const pixelIndex = i + channel;
      if (pixelIndex < data.length) {
        // Clear the LSB and set it to our bit
        data[pixelIndex] = (data[pixelIndex] & 0xFE) | parseInt(fullBinary[binaryIndex]);
        binaryIndex++;
      }
    }
    
    // Update progress
    if (onProgress && i % 12000 === 0) { // Update every 1000 pixels
      const progress = Math.min(95, (i / 4) / totalPixels * 100);
      onProgress(progress);
    }
  }
  
  // Put modified image data back to canvas
  ctx.putImageData(imageData, 0, 0);
  
  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        if (onProgress) onProgress(100);
        resolve(blob);
      } else {
        reject(new Error('Failed to create image blob'));
      }
    }, 'image/png');
  });
}

// Decode message from image
export async function decodeMessage(
  imageFile: File,
  password?: string,
  onProgress?: (progress: number) => void
): Promise<string | null> {
  const { canvas, ctx } = await loadImageToCanvas(imageFile);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Extract message length from first 32 bits
  let binaryData = '';
  let binaryIndex = 0;
  const totalPixels = canvas.width * canvas.height;
  
  // First, extract the length (32 bits)
  for (let i = 0; i < data.length && binaryIndex < 32; i += 4) {
    for (let channel = 0; channel < 3 && binaryIndex < 32; channel++) {
      const pixelIndex = i + channel;
      if (pixelIndex < data.length) {
        binaryData += (data[pixelIndex] & 1).toString();
        binaryIndex++;
      }
    }
  }
  
  const messageLength = parseInt(binaryData, 2);
  if (messageLength <= 0 || messageLength > 1000000) {
    return null; // Invalid length, probably no message
  }
  
  // Now extract the actual message
  binaryData = '';
  binaryIndex = 32; // Start after the length bits
  const messageBits = messageLength * 8;
  let extractedBits = 0;
  
  for (let i = Math.floor(binaryIndex / 3) * 4; i < data.length && extractedBits < messageBits; i += 4) {
    for (let channel = 0; channel < 3 && extractedBits < messageBits; channel++) {
      const pixelIndex = i + channel;
      const globalBitIndex = Math.floor(pixelIndex / 4) * 3 + channel;
      
      if (globalBitIndex >= binaryIndex && pixelIndex < data.length) {
        binaryData += (data[pixelIndex] & 1).toString();
        extractedBits++;
      }
    }
    
    // Update progress
    if (onProgress && i % 12000 === 0) {
      const progress = Math.min(95, extractedBits / messageBits * 100);
      onProgress(progress);
    }
  }
  
  // Convert binary to string
  let message = binaryToString(binaryData);
  
  // Decrypt if password was used
  if (password) {
    const key = simpleHash(password);
    try {
      message = message.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ ((key + i) % 256))
      ).join('');
    } catch (error) {
      return null; // Decryption failed, wrong password
    }
  }
  
  if (onProgress) onProgress(100);
  
  // Return the message if it looks valid
  return message.length > 0 ? message : null;
}
