import type { Schema, Struct } from '@strapi/strapi';

export interface FunctionalComponentsCta extends Struct.ComponentSchema {
  collectionName: 'components_functional_components_ctas';
  info: {
    displayName: 'CTA';
    icon: 'exit';
  };
  attributes: {
    bgImage: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    buttonLabel: Schema.Attribute.String;
    buttonLink: Schema.Attribute.String;
    caption: Schema.Attribute.String;
    contentPosition: Schema.Attribute.Enumeration<['left', 'right', 'center']>;
    ctaClasses: Schema.Attribute.String;
    isExternal: Schema.Attribute.Boolean;
    overlayClasses: Schema.Attribute.String;
    textClasses: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface FunctionalComponentsPackage extends Struct.ComponentSchema {
  collectionName: 'components_functional_components_packages';
  info: {
    displayName: 'package';
    icon: 'clock';
  };
  attributes: {
    discountedPrice: Schema.Attribute.Decimal;
    minutes: Schema.Attribute.Integer;
    price: Schema.Attribute.Integer;
  };
}

export interface FunctionalComponentsSeoModule extends Struct.ComponentSchema {
  collectionName: 'components_functional_components_seo_modules';
  info: {
    displayName: 'SeoModule';
    icon: 'search';
  };
  attributes: {
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.Text;
    metaTitle: Schema.Attribute.String;
    ogDescription: Schema.Attribute.Text;
    ogImage: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    ogTitle: Schema.Attribute.String;
    ogType: Schema.Attribute.String;
    structuredData: Schema.Attribute.Text;
  };
}

export interface GraphicComponentHero extends Struct.ComponentSchema {
  collectionName: 'components_graphic_component_heroes';
  info: {
    displayName: 'Hero';
    icon: 'brush';
  };
  attributes: {
    bgImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    heroClasses: Schema.Attribute.String;
    overlayClasses: Schema.Attribute.String;
    subtitle: Schema.Attribute.Text;
    textClasses: Schema.Attribute.String;
    textPositioning: Schema.Attribute.Enumeration<['central', 'bottom']>;
    title: Schema.Attribute.String;
  };
}

export interface TextComponentsParagraph extends Struct.ComponentSchema {
  collectionName: 'components_text_components_paragraphs';
  info: {
    displayName: 'Paragraph';
    icon: 'bulletList';
  };
  attributes: {
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    imagePosition: Schema.Attribute.Enumeration<
      ['left', 'right', 'up', 'down']
    >;
    isImportant: Schema.Attribute.Boolean;
    paragraphClasses: Schema.Attribute.String;
    text: Schema.Attribute.RichText;
  };
}

export interface TextComponentsQuote extends Struct.ComponentSchema {
  collectionName: 'components_text_components_quotes';
  info: {
    displayName: 'Quote';
    icon: 'discuss';
  };
  attributes: {
    author: Schema.Attribute.String;
    authorDates: Schema.Attribute.String;
    authorDescription: Schema.Attribute.String;
    quoteClasses: Schema.Attribute.String;
    text: Schema.Attribute.Text;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'functional-components.cta': FunctionalComponentsCta;
      'functional-components.package': FunctionalComponentsPackage;
      'functional-components.seo-module': FunctionalComponentsSeoModule;
      'graphic-component.hero': GraphicComponentHero;
      'text-components.paragraph': TextComponentsParagraph;
      'text-components.quote': TextComponentsQuote;
    }
  }
}
