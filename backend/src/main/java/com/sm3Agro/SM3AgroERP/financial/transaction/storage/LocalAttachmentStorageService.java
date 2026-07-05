package com.sm3Agro.SM3AgroERP.financial.transaction.storage;

import com.sm3Agro.SM3AgroERP.financial.transaction.storage.AttachmentStorageProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LocalAttachmentStorageService implements AttachmentStorageService {

    private static final String LOCAL_PROVIDER = "LOCAL";

    private final AttachmentStorageProperties properties;

    @Override
    public StoredAttachmentFile store(Long financialTransactionId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Attachment file is required.");
        }

        Path rootPath = resolveRootPath();
        Path relativeDirectory = Path.of("financial-transactions", String.valueOf(financialTransactionId));
        Path absoluteDirectory = rootPath.resolve(relativeDirectory).normalize();
        String originalFileName = sanitizeFileName(file.getOriginalFilename());
        String storedFileName = UUID.randomUUID() + "-" + originalFileName;
        Path relativeFilePath = relativeDirectory.resolve(storedFileName);
        Path absoluteFilePath = rootPath.resolve(relativeFilePath).normalize();

        ensurePathInsideRoot(rootPath, absoluteDirectory);
        ensurePathInsideRoot(rootPath, absoluteFilePath);

        try {
            Files.createDirectories(absoluteDirectory);
            FileWriteResult writeResult = writeFile(file, absoluteFilePath);

            return new StoredAttachmentFile(
                    originalFileName,
                    file.getContentType(),
                    writeResult.sizeBytes(),
                    LOCAL_PROVIDER,
                    normalizePath(relativeFilePath),
                    null,
                    null,
                    null,
                    writeResult.checksumSha256()
            );
        } catch (IOException exception) {
            deleteQuietly(normalizePath(relativeFilePath));
            throw new UncheckedIOException("Could not store attachment file.", exception);
        }
    }

    @Override
    public void deleteQuietly(String storagePath) {
        if (!StringUtils.hasText(storagePath)) {
            return;
        }

        try {
            Path rootPath = resolveRootPath();
            Path absoluteFilePath = rootPath.resolve(storagePath).normalize();
            ensurePathInsideRoot(rootPath, absoluteFilePath);
            Files.deleteIfExists(absoluteFilePath);
        } catch (Exception ignored) {
            // Best-effort cleanup after transactional failures.
        }
    }

    private Path resolveRootPath() {
        return Path.of(properties.getLocalRoot()).toAbsolutePath().normalize();
    }

    private String sanitizeFileName(String fileName) {
        String candidate = StringUtils.hasText(fileName)
                ? fileName
                : "attachment";
        String cleanedPath = StringUtils.cleanPath(candidate);
        String normalized = StringUtils.getFilename(cleanedPath);

        if (!StringUtils.hasText(normalized)) {
            return "attachment";
        }

        return normalized;
    }

    private void ensurePathInsideRoot(Path rootPath, Path path) {
        if (!path.startsWith(rootPath)) {
            throw new IllegalArgumentException("Attachment path resolved outside configured storage root.");
        }
    }

    private String normalizePath(Path path) {
        return path.toString().replace('\\', '/');
    }

    private FileWriteResult writeFile(MultipartFile file, Path absoluteFilePath) throws IOException {
        MessageDigest digest = createSha256Digest();

        try (
                InputStream rawInput = file.getInputStream();
                DigestInputStream digestInputStream = new DigestInputStream(rawInput, digest);
                OutputStream outputStream = Files.newOutputStream(
                        absoluteFilePath,
                        StandardOpenOption.CREATE_NEW,
                        StandardOpenOption.WRITE
                )
        ) {
            long sizeBytes = digestInputStream.transferTo(outputStream);
            return new FileWriteResult(sizeBytes, HexFormat.of().formatHex(digest.digest()));
        }
    }

    private MessageDigest createSha256Digest() {
        try {
            return MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 algorithm is not available.", exception);
        }
    }

    private record FileWriteResult(long sizeBytes, String checksumSha256) {
    }
}
