/**
 * Cloudinary Image Helper - Format URL để auto optimize
 * f_auto: Auto choose best format (WebP, AVIF, etc)
 * q_auto: Auto choose best quality based on device
 */

/**
 * Format Cloudinary URL để tự động optimize
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transform options
 * @returns {string} - Optimized URL
 *
 * Example:
 * formatCloudinaryUrl('https://res.cloudinary.com/djunoakqr/image/upload/v123/resource_1_789.jpg')
 * => 'https://res.cloudinary.com/djunoakqr/image/upload/f_auto,q_auto/v123/resource_1_789.jpg'
 */
export const formatCloudinaryUrl = (url, options = {}) => {
    if (!url) return '';

    const {
        width = 1000,
        height,
        crop = 'fill',
        gravity = 'auto'
    } = options;

    // Build transform string
    let transform = 'f_auto';

    const shouldAddGravity = gravity && !['fit', 'scale'].includes(crop);

    if (width && height) {
        transform += `,w_${width},h_${height},c_${crop}`;
        if (shouldAddGravity) {
            transform += `,g_${gravity}`;
        }
    } else if (width) {
        transform += `,w_${width},c_${crop}`;
        if (shouldAddGravity) {
            transform += `,g_${gravity}`;
        }
    } else if (height) {
        transform += `,h_${height},c_${crop}`;
        if (shouldAddGravity) {
            transform += `,g_${gravity}`;
        }
    }

    // Insert transform after /upload/
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) {
        return url; // Not a Cloudinary URL
    }

    const baseUrl = url.substring(0, uploadIndex + '/upload/'.length);
    const restUrl = url.substring(uploadIndex + '/upload/'.length);

    // Avoid double-transforming URLs that already include transformations
    const firstSegment = restUrl.split('/')[0];
    if (firstSegment && !firstSegment.startsWith('v')) {
        return url;
    }

    return `${baseUrl}${transform}/${restUrl}`;
};

/**
 * Format URL cho avatar (with aspect ratio)
 */
export const formatAvatarUrl = (url) => {
    return formatCloudinaryUrl(url, {
        width: 256,
        height: 256,
        crop: 'fill',
        gravity: 'face'
    });
};

/**
 * Format URL cho thumbnail (landscape)
 */
export const formatThumbnailUrl = (url) => {
    return formatCloudinaryUrl(url, {
        width: 1000,
        height: 600,
        crop: 'fill',
        gravity: 'auto'
    });
};

/**
 * Format URL cho main image (responsive)
 */
export const formatMainImageUrl = (url) => {
    return formatCloudinaryUrl(url, {
        width: 1000,
        height: 700,
        crop: 'fill',
        gravity: 'auto'
    });
};

/**
 * Format URL cho modal/lightbox (max width)
 */
export const formatLightboxImageUrl = (url) => {
    return formatCloudinaryUrl(url, {
        width: 1200,
        height: 800,
        crop: 'fit',
        gravity: 'auto'
    });
};

/**
 * Get responsive srcset for better image loading
 */
export const getResponsiveSrcset = (url) => {
    if (!url) return '';

    const mobile = formatCloudinaryUrl(url, { width: 400, crop: 'fill' });
    const tablet = formatCloudinaryUrl(url, { width: 800, crop: 'fill' });
    const desktop = formatCloudinaryUrl(url, { width: 1200, crop: 'fill' });

    return `${mobile} 400w, ${tablet} 800w, ${desktop} 1200w`;
};

export default {
    formatCloudinaryUrl,
    formatAvatarUrl,
    formatThumbnailUrl,
    formatMainImageUrl,
    formatLightboxImageUrl,
    getResponsiveSrcset
};
