/**
 * Safe Allowlist Configuration
 *
 * This file defines validation rules for all user inputs to prevent:
 * - Prompt injection attacks on Gemini AI
 * - XSS attacks via unsanitized strings
 * - Database overflow/abuse
 * - Invalid data mutations
 *
 * REVIEW SCHEDULE: Monthly (see SECURITY_REVIEW.md)
 * LAST REVIEWED: 2026-01-09
 * NEXT REVIEW: 2026-02-09
 */

export interface ValidationRule {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  allowedValues?: string[];
  description: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Allowlist Definitions
 *
 * CRITICAL: Directly affects AI prompts or security
 * HIGH: Could cause data corruption or abuse
 * MEDIUM: Could cause user experience issues
 * LOW: Minor validation for consistency
 */
export const ALLOWLISTS = {
  // CRITICAL: Search queries go directly into Gemini prompts
  searchQuery: {
    pattern: /^[a-zA-Z0-9\s\-&'().,]+$/,
    minLength: 1,
    maxLength: 100,
    description: 'Search queries: alphanumeric, spaces, and basic punctuation only',
    riskLevel: 'CRITICAL' as const,
  },

  // CRITICAL: Barcode input goes into Gemini prompts
  barcode: {
    pattern: /^\d{8,14}$/,
    minLength: 8,
    maxLength: 14,
    description: 'UPC/EAN barcodes: 8-14 digits only',
    riskLevel: 'CRITICAL' as const,
  },

  // HIGH: Item names stored in database and shown to users
  itemName: {
    pattern: /^[a-zA-Z0-9\s\-&'().,]+$/,
    minLength: 1,
    maxLength: 100,
    description: 'Shopping list items: alphanumeric and basic punctuation',
    riskLevel: 'HIGH' as const,
  },

  // HIGH: List names shown in UI
  listName: {
    pattern: /^[a-zA-Z0-9\s\-&'().,]+$/,
    minLength: 1,
    maxLength: 50,
    description: 'Shopping list titles',
    riskLevel: 'HIGH' as const,
  },

  // HIGH: User display names shown across the app
  displayName: {
    pattern: /^[a-zA-Z0-9\s\-'.]+$/,
    minLength: 1,
    maxLength: 50,
    description: 'User display names: alphanumeric, spaces, hyphens, apostrophes, periods',
    riskLevel: 'HIGH' as const,
  },

  // HIGH: Price values must be valid numbers
  price: {
    pattern: /^\d+(\.\d{1,2})?$/,
    min: 0.01,
    max: 9999.99,
    description: 'Valid prices: 0.01 to 9999.99',
    riskLevel: 'HIGH' as const,
  },

  // MEDIUM: Store names from AI responses
  storeName: {
    pattern: /^[a-zA-Z0-9\s\-&'().,]+$/,
    minLength: 1,
    maxLength: 100,
    description: 'Store names: alphanumeric and basic punctuation',
    riskLevel: 'MEDIUM' as const,
  },

  // MEDIUM: Location strings for search
  location: {
    pattern: /^[a-zA-Z0-9\s\-,.']+$/,
    minLength: 2,
    maxLength: 100,
    description: 'Location strings: city, state, zip',
    riskLevel: 'MEDIUM' as const,
  },
} as const;

/**
 * System Limits
 *
 * These prevent database overflow and abuse
 */
export const LIMITS = {
  maxShoppingLists: 20,
  maxItemsPerList: 100,
  maxPriceHistoryEntriesPerProduct: 1000,
  maxLocalStorageSizeBytes: 1048576, // 1MB
  maxGeminiRequestsPerMinute: 10,
} as const;

/**
 * Blocked Patterns (Prompt Injection Prevention)
 *
 * These patterns indicate potential prompt injection attempts
 */
const BLOCKED_PATTERNS = [
  /ignore\s+(previous|prior|all)\s+instructions?/i,
  /disregard\s+(previous|prior|all)/i,
  /forget\s+(previous|prior|all)/i,
  /new\s+instructions?:/i,
  /system\s*:/i,
  /you\s+are\s+now/i,
  /act\s+as/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /<script\b/i,
  /javascript:/i,
  /on(load|error|click)\s*=/i,
  /eval\s*\(/i,
  /DROP\s+TABLE/i,
  /DELETE\s+FROM/i,
  /INSERT\s+INTO/i,
  /UPDATE\s+.*SET/i,
] as const;

/**
 * Validate input against an allowlist rule
 */
export function validate(
  input: string | number,
  ruleName: keyof typeof ALLOWLISTS
): ValidationResult {
  const rule = ALLOWLISTS[ruleName];
  const inputStr = String(input).trim();

  // Check if empty
  if (inputStr.length === 0 && 'minLength' in rule && rule.minLength && rule.minLength > 0) {
    return {
      valid: false,
      error: `${ruleName} cannot be empty`,
    };
  }

  // Check min length
  if ('minLength' in rule && rule.minLength && inputStr.length < rule.minLength) {
    return {
      valid: false,
      error: `${ruleName} must be at least ${rule.minLength} characters`,
    };
  }

  // Check max length
  if ('maxLength' in rule && rule.maxLength && inputStr.length > rule.maxLength) {
    return {
      valid: false,
      error: `${ruleName} must be at most ${rule.maxLength} characters`,
    };
  }

  // Check pattern
  if (rule.pattern && !rule.pattern.test(inputStr)) {
    return {
      valid: false,
      error: `${ruleName} contains invalid characters. ${rule.description}`,
    };
  }

  // Check numeric range (for prices)
  if (typeof input === 'number' || !isNaN(Number(inputStr))) {
    const numValue = typeof input === 'number' ? input : Number(inputStr);

    if ('min' in rule && rule.min !== undefined && numValue < rule.min) {
      return {
        valid: false,
        error: `${ruleName} must be at least ${rule.min}`,
      };
    }

    if ('max' in rule && rule.max !== undefined && numValue > rule.max) {
      return {
        valid: false,
        error: `${ruleName} must be at most ${rule.max}`,
      };
    }
  }

  // Check for blocked patterns (prompt injection)
  if (rule.riskLevel === 'CRITICAL') {
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(inputStr)) {
        return {
          valid: false,
          error: `${ruleName} contains blocked pattern (potential security risk)`,
        };
      }
    }
  }

  return {
    valid: true,
    sanitized: inputStr,
  };
}

/**
 * Validate and sanitize multiple items at once
 */
export function validateBatch(
  items: string[],
  ruleName: keyof typeof ALLOWLISTS
): ValidationResult {
  for (let i = 0; i < items.length; i++) {
    const result = validate(items[i], ruleName);
    if (!result.valid) {
      return {
        valid: false,
        error: `Item ${i + 1}: ${result.error}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Check if user has exceeded shopping list limits
 */
export function checkShoppingListLimits(
  currentListCount: number,
  itemsInNewList?: number
): ValidationResult {
  if (currentListCount >= LIMITS.maxShoppingLists) {
    return {
      valid: false,
      error: `Maximum ${LIMITS.maxShoppingLists} shopping lists allowed`,
    };
  }

  if (itemsInNewList && itemsInNewList > LIMITS.maxItemsPerList) {
    return {
      valid: false,
      error: `Maximum ${LIMITS.maxItemsPerList} items per list allowed`,
    };
  }

  return { valid: true };
}

/**
 * Check if price history has exceeded limits
 */
export function checkPriceHistoryLimits(
  currentEntryCount: number
): ValidationResult {
  if (currentEntryCount >= LIMITS.maxPriceHistoryEntriesPerProduct) {
    return {
      valid: false,
      error: `Maximum ${LIMITS.maxPriceHistoryEntriesPerProduct} price history entries per product`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize output from Gemini (remove potentially dangerous content)
 */
export function sanitizeAIResponse(response: string): string {
  // Remove any script tags
  let sanitized = response.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  return sanitized.trim();
}

/**
 * Validate Firestore user object fields
 *
 * Only these fields can be written by clients:
 * - name (displayName)
 * - avatar (photoURL)
 * - lastActive (timestamp)
 *
 * BLOCKED from client writes:
 * - isPro (must be set server-side only)
 * - dailySearches (must be set server-side only)
 * - id (immutable)
 * - email (from Firebase Auth only)
 */
export const FIRESTORE_USER_ALLOWLIST = {
  allowedFields: ['name', 'avatar', 'lastActive'] as const,
  blockedFields: ['isPro', 'dailySearches', 'id', 'email'] as const,
};

export function validateFirestoreUserUpdate(
  updateData: Record<string, any>
): ValidationResult {
  const keys = Object.keys(updateData);

  // Check for blocked fields
  for (const key of keys) {
    if (FIRESTORE_USER_ALLOWLIST.blockedFields.includes(key as any)) {
      return {
        valid: false,
        error: `Field '${key}' cannot be updated from client (security restriction)`,
      };
    }

    if (!FIRESTORE_USER_ALLOWLIST.allowedFields.includes(key as any)) {
      return {
        valid: false,
        error: `Field '${key}' is not in the allowlist`,
      };
    }
  }

  // Validate specific fields
  if (updateData.name) {
    const nameValidation = validate(updateData.name, 'displayName');
    if (!nameValidation.valid) {
      return nameValidation;
    }
  }

  return { valid: true };
}

/**
 * Get all high and critical risk allowlist rules for monthly review
 */
export function getHighRiskRules(): Array<{
  name: string;
  rule: ValidationRule;
}> {
  return Object.entries(ALLOWLISTS)
    .filter(([_, rule]) => rule.riskLevel === 'CRITICAL' || rule.riskLevel === 'HIGH')
    .map(([name, rule]) => ({ name, rule }));
}
