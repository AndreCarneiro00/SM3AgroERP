package com.sm3Agro.SM3AgroERP.financial.transaction.storage;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "sm3.storage.attachments")
public class AttachmentStorageProperties {

    private String localRoot = "uploads/financial-attachments";
}
