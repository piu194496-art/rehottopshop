// Profanity Filter Utility
class ProfanityFilter {
    constructor() {
        // List of inappropriate words to filter
        this.profanityList = [
            'damn', 'hell', 'crap', 'shit', 'fuck', 'ass', 'bitch', 'bastard',
            'dick', 'piss', 'cock', 'pussy', 'whore', 'slut', 'fag', 'dyke',
            'retard', 'idiot', 'stupid', 'dumb', 'moron', 'imbecile'
        ];

        // Create regex pattern for case-insensitive matching
        this.pattern = new RegExp(
            this.profanityList.map(word => `\\b${word}\\b`).join('|'),
            'gi'
        );
    }

    // Check if text contains profanity
    containsProfanity(text) {
        if (!text) return false;
        return this.pattern.test(text);
    }

    // Filter profanity from text by replacing with asterisks
    filter(text) {
        if (!text) return text;

        return text.replace(this.pattern, (match) => {
            // Replace each character except first and last with asterisk
            if (match.length <= 2) {
                return '*'.repeat(match.length);
            }
            return match[0] + '*'.repeat(match.length - 2) + match[match.length - 1];
        });
    }

    // Clean keywords by removing profane words entirely
    cleanKeywords(keywords) {
        if (!keywords) return keywords;

        // Split by comma, filter out profane words, rejoin
        const keywordArray = keywords.split(',').map(k => k.trim());
        const cleanedKeywords = keywordArray.filter(keyword => !this.containsProfanity(keyword));

        return cleanedKeywords.join(', ');
    }

    // Validate input - returns object with isValid and message
    validate(text, fieldName = 'Input') {
        if (this.containsProfanity(text)) {
            return {
                isValid: false,
                message: `${fieldName} contains inappropriate language. Please revise your text.`
            };
        }
        return {
            isValid: true,
            message: ''
        };
    }
}

// Create global instance
const profanityFilter = new ProfanityFilter();
