import glossary from "~/routes/_auth+/glossary";

export function getErrorMessage(error: unknown): string {
  // Handle string errors
  if (typeof error === "string") {
    return mapErrorToArabic(error);
  }

  // Handle object errors with error codes or messages
  if (error && typeof error === "object") {
    // Check for error code first (better-auth style)
    if ("code" in error && typeof error.code === "string") {
      return mapErrorCodeToArabic(error.code);
    }

    // Check for message property
    if ("message" in error && typeof error.message === "string") {
      return mapErrorToArabic(error.message);
    }
  }

  console.error("Unable to get error message for error", error);
  return glossary.login.errors.unexpectedError;
}

function mapErrorCodeToArabic(code: string): string {
  const errorMappings: { [key: string]: string } = {
    // Better-auth error codes
    EMAIL_IS_NOT_VERIFIED_CHECK_YOUR_EMAIL_FOR_A_VERIFICATION_LINK:
      glossary.login.errors.unverified,
    FAILED_TO_CREATE_SESSION: glossary.login.errors.sessionFailure,
    INVALID_EMAIL_OR_PASSWORD: glossary.login.errors.invalidCredentials,
    INVALID_EMAIL: glossary.login.errors.invalidCredentials,
    INVALID_PASSWORD: glossary.login.errors.wrongPassword,
    USER_NOT_FOUND: glossary.login.errors.userNotFound,
    ACCOUNT_NOT_VERIFIED: glossary.login.errors.unverified,
    TOO_MANY_REQUESTS: glossary.login.errors.tooManyAttempts,
    NETWORK_ERROR: glossary.login.errors.networkError,
    INTERNAL_SERVER_ERROR: glossary.login.errors.serverError,

    // Custom application error codes
    ACCOUNT_DEACTIVATED: glossary.login.errors.accountDeactivated,
    ACCOUNT_PENDING: glossary.login.errors.accountPending,
    ACCOUNT_DENIED: glossary.login.errors.accountDenied,
  };

  return errorMappings[code] || glossary.login.errors.generic;
}

function mapErrorToArabic(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Check for common error patterns
  if (lowerMessage.includes("email") && lowerMessage.includes("not found")) {
    return glossary.login.errors.userNotFound;
  }

  if (lowerMessage.includes("password") && lowerMessage.includes("incorrect")) {
    return glossary.login.errors.wrongPassword;
  }

  if (lowerMessage.includes("network") || lowerMessage.includes("connection")) {
    return glossary.login.errors.networkError;
  }

  if (lowerMessage.includes("server") || lowerMessage.includes("internal")) {
    return glossary.login.errors.serverError;
  }

  if (
    lowerMessage.includes("verify") ||
    lowerMessage.includes("verification")
  ) {
    return glossary.login.errors.unverified;
  }

  if (lowerMessage.includes("session")) {
    return glossary.login.errors.sessionFailure;
  }

  if (
    lowerMessage.includes("deactivated") ||
    lowerMessage.includes("disabled")
  ) {
    return glossary.login.errors.accountDeactivated;
  }

  if (lowerMessage.includes("pending")) {
    return glossary.login.errors.accountPending;
  }

  if (lowerMessage.includes("denied") || lowerMessage.includes("rejected")) {
    return glossary.login.errors.accountDenied;
  }

  // Default fallback
  return glossary.login.errors.generic;
}
