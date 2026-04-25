import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly baseUrl: string;

  constructor() {
    // Use imageUrl from environment, fallback to apiUrl if imageUrl is not defined
    this.baseUrl = environment.imageUrl || environment.apiUrl;
  }

  /**
   * Get full image URL from a relative path
   * @param imagePath - The image path (can be relative or absolute)
   * @returns Full URL to the image
   */
  getImageUrl(imagePath?: string | { url: string }): string {
    if (!imagePath) {
      return '';
    }

    // If it's already a full URL, return as is
    if (typeof imagePath === 'string' && imagePath.startsWith('http')) {
      return imagePath;
    }

    // If it's an object with url property
    if (typeof imagePath === 'object' && imagePath.url) {
      return this.getImageUrl(imagePath.url);
    }

    // If it's a relative path, prepend the base URL
    if (typeof imagePath === 'string') {
      return imagePath.startsWith('/') 
        ? `${this.baseUrl}${imagePath}` 
        : `${this.baseUrl}/${imagePath}`;
    }

    return '';
  }

  /**
   * Get company logo URL
   * @param logoPath - The logo path
   * @returns Full URL to the company logo
   */
  getLogoUrl(logoPath?: string): string {
    return this.getImageUrl(logoPath);
  }

  /**
   * Get resume download URL
   * @param resumePath - The resume file path
   * @returns Full URL to download the resume
   */
  getResumeUrl(resumePath?: string): string {
    return this.getImageUrl(resumePath);
  }

  /**
   * Get user avatar URL
   * @param avatarPath - The avatar path
   * @returns Full URL to the user avatar
   */
  getAvatarUrl(avatarPath?: string): string {
    return this.getImageUrl(avatarPath);
  }

  /**
   * Handle image error and return fallback
   * @param event - Error event from img tag
   * @param fallbackUrl - Optional fallback URL
   */
  onImageError(event: any, fallbackUrl?: string): void {
    const img = event.target;
    
    // Try fallback URL if provided
    if (fallbackUrl) {
      img.src = fallbackUrl;
      return;
    }

    // Hide broken image
    img.style.display = 'none';
    
    // Optionally show a placeholder
    if (img.parentElement) {
      const placeholder = document.createElement('div');
      placeholder.className = 'image-placeholder';
      placeholder.innerHTML = `
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" fill="#f3f4f6"/>
          <path d="M50 30C54.4183 30 58 33.5817 58 38C58 42.4183 54.4183 46 50 46C45.5817 46 42 42.4183 42 38C42 33.5817 45.5817 30 50 30Z" fill="#9ca3af"/>
          <path d="M30 70C30 62.268 36.268 56 44 56H56C63.732 56 70 62.268 70 70V74H30V70Z" fill="#9ca3af"/>
        </svg>
      `;
      placeholder.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${img.width || 100}px;
        height: ${img.height || 100}px;
        background-color: #f3f4f6;
        border-radius: 8px;
      `;
      img.parentElement.appendChild(placeholder);
    }
  }
}
