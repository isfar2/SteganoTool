# SteganoTool

**SteganoTool** is a lightweight, privacy-focused web application that lets you **hide secret text messages inside images** using LSB (Least Significant Bit) steganography. All operations happen **locally in your browser**, no data is ever uploaded or stored externally, which means it is client-sided. I made this project so I could practice and develop my skills in TypeScript.

**⚠️ Warning ⚠️**
> Steganography doesnt have a universal standard. Unless the encoding and decoding tools use the exact same method, the decoder may not find the message or will misinterpret it.

---

## Features

- **Hide text in images** using LSB steganography
- **Extract hidden messages** from images
- Supports **PNG (lossless)** and **JPEG (lossy)** formats
- **Optional password protection** for added security
- **Client-side only** — no server, no data tracking
- Built-in **image format converter** (JPEG, PNG, WebP, GIF)
- Responsive UI, dark theme by default

---

## How It Works

SteganoTool uses **Least Significant Bit (LSB)** manipulation to embed secret messages into the pixel data of images.

1. The image is analyzed to find the best bit placement.
2. Your message is converted into binary.
3. The binary message is written into the image’s least significant pixel bits.
4. Visually, the image appears unchanged but it now contains hidden data which can be **decoded**.

> No changes are visible to the human eye.

---

## Usage

### Encode (Hide Message)

1. Upload or drag-and-drop your **image**.
2. Enter the **secret message** to be embedded into the image.
3. (Optional) Add a **password** to protect the message.
4. Click **Encode Message** to generate the steganographic image.
5. Download the image.

### Decode (Extract Message)

1. Upload the **steganographic image**.
2. (If needed) Enter the **password**.
3. Click **EXTRACT** to reveal the hidden message.
> If the image is password protected, you may see garbled text.   

### Image Format Converter

1. Upload any supported image.
2. Choose output format and quality.
3. Click **CONVERT IMAGE** to download.

---

## Supported Formats

| Format | Type              | Notes                     |
|--------|-------------------|---------------------------|
| PNG    | Lossless          | Recommended for best quality |
| JPEG   | Lossy             | Limited capacity          |
| WebP   | Lossy/Lossless    | Supported in conversion   |
| GIF    | Limited support   | Conversion only           |

---

## Technologies Used

- TypeScript (client-side logic)
- HTML5 / CSS3

---

## Security & Privacy

- All data is processed **locally** in the browser
- No tracking, analytics, or server interaction
- Messages can be optionally **password-protected**
- Open source

