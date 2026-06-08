package com.qloudprint.qloudprint_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AccountCleanupScheduler {

    private final AuthService authService;

    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupStaleUnverifiedAccounts() {

        int deleted =
                authService.deleteStaleUnverifiedUsers();

        if (deleted > 0) {
            System.out.println("Deleted stale unverified QloudPrint accounts: " + deleted);
        }
    }
}
