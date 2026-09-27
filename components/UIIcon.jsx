// UIIcon — renders whatever is passed as an "icon" value across the app.
//
// The app's data uses three different kinds of "icon" values depending on
// where they were written:
//   1. A path into /public/icons/*.png   -> the new custom icon set
//   2. A lucide-react component (e.g. Target, Trophy)  -> <Component />
//   3. Anything else (an emoji character, plain text, null/undefined)
//
// Rendering these three kinds directly with `{icon}` or `<Icon />` breaks for
// at least one of the three cases (a string can't be used as a JSX tag, and a
// component reference can't just be dropped in as text). This component
// checks the value's type/shape and renders it the right way every time, so
// old emoji-based data and the new custom icons can coexist without errors.
export function UIIcon({ icon, className = 'w-5 h-5', ...rest }) {
  if (!icon) return null

  if (typeof icon === 'string' && icon.startsWith('/icons/')) {
    return <img src={icon} alt="" className={`${className} object-contain inline-block`} {...rest} />
  }

  const isComponent =
    typeof icon === 'function' ||
    (icon && typeof icon === 'object' && icon.$$typeof)

  if (isComponent) {
    const IconComp = icon
    return <IconComp className={className} {...rest} />
  }

  // Plain text / emoji fallback — renders exactly as it did before.
  // (extra props like style are ignored here since text nodes can't take them)
  return icon
}
