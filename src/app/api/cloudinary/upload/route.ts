import { NextRequest, NextResponse } from 'next/server';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export async function POST(request: NextRequest) {
  try {
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { file, folder, publicId } = body;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Build upload params for Cloudinary signature
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Build the parameters to sign (sorted alphabetically by key, then joined with &)
    const params: Record<string, string> = {
      timestamp,
    };

    if (folder) {
      params.folder = folder;
    }

    if (publicId) {
      params.public_id = publicId;
    }

    // Sort keys and create the string to sign
    const sortedKeys = Object.keys(params).sort();
    const stringToSign = sortedKeys.map(key => `${key}=${params[key]}`).join('&') + API_SECRET;

    // Generate SHA-1 signature using Web Crypto API
    // Cloudinary expects a plain SHA-1 digest of (sorted_params + api_secret)
    const encoder = new TextEncoder();
    const signatureBuffer = await crypto.subtle.digest(
      'SHA-1',
      encoder.encode(stringToSign)
    );

    const signature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Build form data for Cloudinary upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', API_KEY);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    if (folder) {
      formData.append('folder', folder);
    }

    if (publicId) {
      formData.append('public_id', publicId);
    }

    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error('Cloudinary upload error:', errorText);
      return NextResponse.json(
        { error: 'Upload ke Cloudinary gagal' },
        { status: uploadRes.status }
      );
    }

    const result = await uploadRes.json();

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
