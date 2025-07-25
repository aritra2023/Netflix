import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faHome, 
  faSearch, 
  faHeart, 
  faStar, 
  faFilm, 
  faPlay, 
  faList, 
  faChevronUp, 
  faBars,
  faXmark,
  faArrowLeft,
  faTrash,
  faPlus,
  faUser,
  faClock,
  faCircleExclamation,
  faCircleInfo,
  faTimes,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

// Add all icons to the library so you can use it in your components
export const setupFontAwesome = () => {
  library.add(
    faHome,
    faSearch,
    faHeart,
    faStar,
    faFilm,
    faPlay,
    faList,
    faChevronUp,
    faBars,
    faXmark,
    faArrowLeft,
    faTrash,
    faPlus,
    faUser,
    faClock,
    faCircleExclamation,
    faCircleInfo,
    faTimes,
    faInfoCircle
  );
};