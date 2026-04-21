import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

/**
 * POST /api/cloudinary/upload
 *
 * Uploads an image to Cloudinary.
 * Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET env vars.
 *
 * Request body:
 *   { file: string (base64 data URI), folder: string, publicId?: string }
 *
 * Response:
 *   { url: string, publicId: string, width: number, height: number, format: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { file: fileData, folder = 'general', publicId } = body;

    if (!fileData) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file is a base64 data URI
    if (!fileData.startsWith('data:')) {
      return NextResponse.json({ error: 'Invalid file format — expected base64 data URI' }, { status: 400 });
    }

    // Extract MIME type and validate it's an image
    const mimeMatch = fileData.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    if (!mimeMatch) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate Cloudinary configuration
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary not configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env' },
        { status: 500 }
      );
    }

    // Generate signed upload parameters
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Build signature string — parameters must be sorted alphabetically
    const paramsToSign: Record<string, string> = {
      folder,
      timestamp,
    };
    if (publicId) {
      paramsToSign['public_id'] = publicId;
    }

    // Sort and concatenate for signature
    const signatureString = Object.keys(paramsToSign)
      .sort()
      .map(key => `${key}=${paramsToSign[key]}`)
      .join('&') + API_SECRET;

    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    // Build FormData for Cloudinary upload
    const formData = new FormData();
    formData.append('file', fileData);
    formData.append('folder', folder);
    formData.append('timestamp', timestamp);
    formData.append('api_key', API_KEY);
    formData.append('signature', signature);
    if (publicId) {
      formData.append('public_id', publicId);
    }

    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[cloudinary/upload] Cloudinary upload failed:', errorText);
      let errorMessage = 'Upload ke Cloudinary gagal';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {}
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const result = await response.json();

    console.log(`[cloudinary/upload] ✓ Uploaded: ${result.public_id} → ${result.secure_url}`);

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    });

  } catch (error: any) {
    console.error('[cloudinary/upload] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload gagal' },
      { status: 500 }
    );
  }
}
