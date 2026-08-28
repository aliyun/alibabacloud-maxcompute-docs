import OriginalComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import type {ComponentTypesObject} from '@theme/NavbarItem/ComponentTypes';
import NavbarDocSearch from '@site/src/components/DocSearch';
import NavbarProductMenu from '@site/src/components/NavbarProductMenu';

const ComponentTypes = {
  ...OriginalComponentTypes,
  'custom-product-menu': NavbarProductMenu,
  'custom-doc-search': NavbarDocSearch,
} satisfies ComponentTypesObject;

export default ComponentTypes;
