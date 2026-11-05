import prisma from '../db/prisma';

interface EligibilityInput {
  district: string;
  age: number;
  maritalStatus: 'married' | 'unmarried' | 'widow' | 'divorced';
  isPregnant: boolean;
  isSHGMember: boolean;
  isBPL: boolean;
}

interface MatchResult {
  scheme: any;
  matchedRules: string[];
  matchedRulesHi: string[];
}

export class EligibilityService {
  static async findMatchingSchemes(input: EligibilityInput): Promise<MatchResult[]> {
    const schemes = await prisma.scheme.findMany({
      where: { published: true },
      include: { helpCentre: true },
    });

    const results: MatchResult[] = [];

    for (const scheme of schemes) {
      const eligibility = scheme.eligibility as any;
      if (!eligibility) continue;

      const matchedRules: string[] = [];
      const matchedRulesHi: string[] = [];
      let isEligible = true;

      // Check district
      if (eligibility.district && eligibility.district.length > 0) {
        if (eligibility.district.includes(input.district) || eligibility.district.includes('all')) {
          matchedRules.push(`District: ${input.district} is covered`);
          matchedRulesHi.push(`जिला: ${input.district} शामिल है`);
        } else {
          isEligible = false;
        }
      }

      // Check age
      if (eligibility.minAge !== undefined && input.age < eligibility.minAge) {
        isEligible = false;
      } else if (eligibility.maxAge !== undefined && input.age > eligibility.maxAge) {
        isEligible = false;
      } else if (eligibility.minAge !== undefined || eligibility.maxAge !== undefined) {
        matchedRules.push(`Age ${input.age} is within range (${eligibility.minAge || 0}–${eligibility.maxAge || '∞'})`);
        matchedRulesHi.push(`आयु ${input.age} सीमा में है (${eligibility.minAge || 0}–${eligibility.maxAge || '∞'})`);
      }

      // Check marital status
      if (eligibility.maritalStatus && eligibility.maritalStatus.length > 0) {
        if (eligibility.maritalStatus.includes(input.maritalStatus)) {
          matchedRules.push(`Marital status: ${input.maritalStatus} is eligible`);
          matchedRulesHi.push(`वैवाहिक स्थिति: मान्य`);
        } else {
          isEligible = false;
        }
      }

      // Check pregnancy
      if (eligibility.requiresPregnancy && !input.isPregnant) {
        isEligible = false;
      } else if (eligibility.requiresPregnancy && input.isPregnant) {
        matchedRules.push('Pregnancy requirement met');
        matchedRulesHi.push('गर्भावस्था की शर्त पूरी');
      }

      // Check SHG membership
      if (eligibility.requiresSHG && !input.isSHGMember) {
        isEligible = false;
      } else if (eligibility.requiresSHG && input.isSHGMember) {
        matchedRules.push('SHG membership confirmed');
        matchedRulesHi.push('स्वयं सहायता समूह सदस्यता पुष्ट');
      }

      // Check BPL
      if (eligibility.requiresBPL && !input.isBPL) {
        isEligible = false;
      } else if (eligibility.requiresBPL && input.isBPL) {
        matchedRules.push('BPL card holder');
        matchedRulesHi.push('बीपीएल कार्ड धारक');
      }

      if (isEligible && matchedRules.length > 0) {
        results.push({ scheme, matchedRules, matchedRulesHi });
      }
    }

    return results;
  }
}
