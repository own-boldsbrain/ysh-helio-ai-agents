// Accessibility utilities for WCAG 2.1 compliance
export class AccessibilityUtils {
  /**
   * Checks if the contrast ratio meets WCAG 2.1 AA standards
   * @param backgroundColor Background color in hex format
   * @param textColor Text color in hex format
   * @returns true if contrast ratio is sufficient for AA compliance
   */
  static checkContrastRatio(backgroundColor: string, textColor: string): boolean {
    const bgRgb = this.hexToRgb(backgroundColor)
    const textRgb = this.hexToRgb(textColor)

    if (!bgRgb || !textRgb) return false

    const bgLum = this.getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b)
    const textLum = this.getRelativeLuminance(textRgb.r, textRgb.g, textRgb.b)

    const ratio = bgLum > textLum ? (textLum + 0.05) / (bgLum + 0.05) : (bgLum + 0.05) / (textLum + 0.05)

    // WCAG 2.1 AA requires 4.5:1 for normal text, 3:1 for large text
    return ratio >= 4.5
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  private static getRelativeLuminance(r: number, g: number, b: number): number {
    const rs = r / 255 <= 0.03928 ? r / 255 / 12.92 : Math.pow((r / 255 + 0.055) / 1.055, 2.4)
    const gs = g / 255 <= 0.03928 ? g / 255 / 12.92 : Math.pow((g / 255 + 0.055) / 1.055, 2.4)
    const bs = b / 255 <= 0.03928 ? b / 255 / 12.92 : Math.pow((b / 255 + 0.055) / 1.055, 2.4)

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  /**
   * Ensures all interactive elements have proper focus management
   */
  static ensureFocusManagement(): void {
    // Add focus styles to interactive elements
    const style = document.createElement('style')
    style.textContent = `
      button:focus,
      [href]:focus,
      input:focus,
      select:focus,
      textarea:focus,
      [tabindex]:focus {
        outline: 2px solid #4f46e5; /* Primary color */
        outline-offset: 2px;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Adds ARIA attributes to elements for better screen reader support
   */
  static addAriaLabels(): void {
    // Add aria-labels to elements that need them
    const buttons = document.querySelectorAll<HTMLButtonElement>('button[title]:not([aria-label])')
    buttons.forEach((button: HTMLButtonElement) => {
      const title = button.getAttribute('title')
      if (title) {
        button.setAttribute('aria-label', title)
      }
    })
  }

  /**
   * Validates form accessibility
   */
  static validateFormAccessibility(form: HTMLFormElement): { isValid: boolean; issues: string[] } {
    const issues: string[] = []

    // Check for labels
    const inputs = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input, textarea, select',
    )
    inputs.forEach((input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
      const id = input.id
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`)
        if (!label) {
          issues.push(`Input with id "${id}" has no associated label`)
        }
      } else if (
        !(input as HTMLElement).getAttribute('aria-label') &&
        !(input as HTMLElement).getAttribute('aria-labelledby')
      ) {
        issues.push(`Input without id or aria-label: ${input.tagName}`)
      }
    })

    return {
      isValid: issues.length === 0,
      issues,
    }
  }
}

// Initialize accessibility utilities when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      AccessibilityUtils.ensureFocusManagement()
      AccessibilityUtils.addAriaLabels()
    })
  } else {
    AccessibilityUtils.ensureFocusManagement()
    AccessibilityUtils.addAriaLabels()
  }
}
