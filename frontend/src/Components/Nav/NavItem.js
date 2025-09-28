import { NavLink } from "react-router-dom";

export default function NavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-lg font-medium transition-colors duration-300 flex items-center space-x-1 ${
          isActive
            ? "text-yellow-300 font-semibold"
            : "text-white hover:text-yellow-300"
        }`
      }
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      <span>{label}</span>
    </NavLink>
  );
}
