package com.touring.touringbackend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@Slf4j
public class CloudinaryService {

	private final Cloudinary cloudinary;

	public CloudinaryService(@Value("${cloudinary.cloud_name:}") String cloudName,
							 @Value("${cloudinary.api_key:}") String apiKey,
							 @Value("${cloudinary.api_secret:}") String apiSecret) {
		this.cloudinary = new Cloudinary(ObjectUtils.asMap(
				"cloud_name", cloudName,
				"api_key", apiKey,
				"api_secret", apiSecret
		));
	}

	/**
	 * Uploads an image to Cloudinary. Returns the raw upload result map which includes
	 * keys like `secure_url` and `public_id`.
	 */
	public Map uploadImage(MultipartFile file, Long tourId) {
		try {
			Map options = ObjectUtils.asMap("folder", "touring/tours/" + (tourId != null ? tourId : "general"));
			byte[] bytes = file.getBytes();
			return cloudinary.uploader().upload(bytes, options);
		} catch (IOException e) {
			log.error("Failed to upload image to Cloudinary", e);
			throw new RuntimeException("Failed to upload image", e);
		}
	}

	/**
	 * Deletes an image by its public id. Logs any error but does not throw for idempotency.
	 */
	public void deleteImage(String publicId) {
		if (publicId == null || publicId.isBlank()) return;
		try {
			cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
		} catch (Exception e) {
			log.warn("Cloudinary destroy failed for publicId={}", publicId, e);
		}
	}
}
