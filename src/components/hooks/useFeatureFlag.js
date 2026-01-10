import { useSession } from '@/components/hooks/useSession';
import { FEATURE_FLAGS } from '@/components/config/featureFlags';

/**
 * useFeatureFlag Hook
 * Resolves whether a specific feature is enabled for the current context.
 * 
 * Priority:
 * 1. User Override (if applicable)
 * 2. School Setting (if applicable)
 * 3. Global Default
 * 
 * @param {string} flagKey - Key from FEATURE_FLAGS
 * @returns {boolean} - Whether the feature is enabled
 */
export function useFeatureFlag(flagKey) {
  const { user, activeSchool } = useSession();
  
  const flagDef = FEATURE_FLAGS[flagKey];
  if (!flagDef) {
    console.warn(`Unknown feature flag: ${flagKey}`);
    return false;
  }

  // 1. Check User Override (e.g. for beta testers)
  if (user?.feature_flags && typeof user.feature_flags[flagKey] !== 'undefined') {
    return !!user.feature_flags[flagKey];
  }

  // 2. Check School Setting
  if (activeSchool?.feature_flags && typeof activeSchool.feature_flags[flagKey] !== 'undefined') {
    return !!activeSchool.feature_flags[flagKey];
  }

  // 3. Fallback to Default
  return flagDef.defaultValue;
}

/**
 * Helper to check multiple flags
 * Re-implementation to avoid Hook Rules violation.
 * We must extract the session ONCE and then compute the flags.
 */
export function useFeatureFlags(flagKeys) {
  const { user, activeSchool } = useSession();
  
  return flagKeys.reduce((acc, key) => {
    const flagDef = FEATURE_FLAGS[key];
    if (!flagDef) {
      acc[key] = false;
      return acc;
    }

    let val = flagDef.defaultValue;

    if (activeSchool?.feature_flags && typeof activeSchool.feature_flags[key] !== 'undefined') {
      val = !!activeSchool.feature_flags[key];
    }

    if (user?.feature_flags && typeof user.feature_flags[key] !== 'undefined') {
      val = !!user.feature_flags[key];
    }

    acc[key] = val;
    return acc;
  }, {});
}