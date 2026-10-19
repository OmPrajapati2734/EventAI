export interface IThemeIdeaProps {
  id: string;
  title: string;
  description: string;
  colorPalette: string[];
  decorationSuggestions: string[];
  vibeKeywords: string[];
}

/**
 * ThemeIdea Value Object / Entity representing AI-curated celebration aesthetics.
 */
export class ThemeIdea {
  public readonly id: string;
  public readonly title: string;
  public readonly description: string;
  public readonly colorPalette: readonly string[];
  public readonly decorationSuggestions: readonly string[];
  public readonly vibeKeywords: readonly string[];

  constructor(props: IThemeIdeaProps) {
    this.validate(props);
    this.id = props.id;
    this.title = props.title.trim();
    this.description = props.description.trim();
    this.colorPalette = Object.freeze([...props.colorPalette.map(c => c.trim())]);
    this.decorationSuggestions = Object.freeze([...props.decorationSuggestions.map(d => d.trim())]);
    this.vibeKeywords = Object.freeze([...props.vibeKeywords.map(v => v.trim())]);
  }

  private validate(props: IThemeIdeaProps): void {
    if (!props.id || typeof props.id !== 'string') {
      throw new Error('ThemeIdea ID must be a non-empty string.');
    }
    if (!props.title || props.title.trim().length === 0) {
      throw new Error('ThemeIdea title cannot be empty.');
    }
    if (!props.description || props.description.trim().length === 0) {
      throw new Error('ThemeIdea description cannot be empty.');
    }
    if (!Array.isArray(props.colorPalette) || props.colorPalette.length === 0) {
      throw new Error('ThemeIdea must contain at least one color in colorPalette.');
    }
    if (!Array.isArray(props.decorationSuggestions)) {
      throw new Error('ThemeIdea decorationSuggestions must be an array.');
    }
    if (!Array.isArray(props.vibeKeywords)) {
      throw new Error('ThemeIdea vibeKeywords must be an array.');
    }
  }

  public toJSON(): IThemeIdeaProps {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      colorPalette: [...this.colorPalette],
      decorationSuggestions: [...this.decorationSuggestions],
      vibeKeywords: [...this.vibeKeywords],
    };
  }
}
