package com.sm3Agro.SM3AgroERP.common.persistence;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Converter(autoApply = true)
public class LocalDateStringConverter implements AttributeConverter<LocalDate, String> {

    private static final DateTimeFormatter DATABASE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd '00:00:00.000'");

    @Override
    public String convertToDatabaseColumn(LocalDate attribute) {
        return attribute == null ? null : attribute.format(DATABASE_FORMATTER);
    }

    @Override
    public LocalDate convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }

        String value = dbData.trim();
        if (value.chars().allMatch(Character::isDigit)) {
            return Instant.ofEpochMilli(Long.parseLong(value))
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();
        }

        return LocalDate.parse(value.substring(0, 10));
    }
}
