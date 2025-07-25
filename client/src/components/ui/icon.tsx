import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
  faCircleInfo
} from '@fortawesome/free-solid-svg-icons';

// A map for translating lucide-react icon names to font-awesome equivalents
const iconMap = {
  // Navigation
  'home': faHome,
  'search': faSearch,
  'heart': faHeart,
  'star': faStar,
  'film': faFilm,
  'play': faPlay,
  'list': faList,
  'chevron-up': faChevronUp,
  'menu': faBars,
  'x': faXmark,
  'arrow-left': faArrowLeft,
  'trash': faTrash,
  'plus': faPlus,
  'user': faUser,
  'clock': faClock,
  'alert-circle': faCircleExclamation,
  'info': faCircleInfo
};

type IconName = keyof typeof iconMap;

export interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  'xs': 'text-xs',
  'sm': 'text-sm',
  'md': 'text-base',
  'lg': 'text-lg',
  'xl': 'text-xl',
};

export function Icon({ name, size = 'md', className, ...props }: IconProps) {
  // Get the font awesome icon
  const icon = iconMap[name];
  
  if (!icon) {
    console.warn(`Icon "${name}" not found in icon map`);
    return null;
  }
  
  const sizeClass = sizeMap[size];
  
  return (
    <div className={`inline-flex ${sizeClass} ${className || ''}`} {...props}>
      <FontAwesomeIcon icon={icon} />
    </div>
  );
}