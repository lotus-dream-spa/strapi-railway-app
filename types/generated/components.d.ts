import type { Schema, Struct } from '@strapi/strapi';

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

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'functional-components.package': FunctionalComponentsPackage;
    }
  }
}
