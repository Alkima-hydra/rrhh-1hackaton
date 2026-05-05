import { NavLink, Outlet, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

import { 
  Building2, 
  Target, 
  Users, 
  Palmtree, 
  ClipboardList, 
  FileText, 
  Banknote 
} from 'lucide-react';

const navItems = [
  { label: 'Organización', items: [
    { to: '/areas', icon: <Building2 size={20} />, label: 'Áreas' },
    { to: '/cargos', icon: <Target size={20} />, label: 'Cargos' },
  ]},
  { label: 'Personal', items: [
    { to: '/funcionarios', icon: <Users size={20} />, label: 'Funcionarios' },
    { to: '/vacaciones', icon: <Palmtree size={20} />, label: 'Vacaciones' },
  ]},
  { label: 'Documentos', items: [
    { to: '/plantillas', icon: <ClipboardList size={20} />, label: 'Plantillas de Contrato' },
    { to: '/contratos', icon: <FileText size={20} />, label: 'Contratos' },
  ]},
  { label: 'Pagos', items: [
    { to: '/boletas', icon: <Banknote size={20} />, label: 'Boletas de Pago' },
  ]},
];

const pageTitles = {
  '/areas': 'Áreas',
  '/cargos': 'Cargos',
  '/funcionarios': 'Funcionarios',
  '/vacaciones': 'Vacaciones',
  '/plantillas': 'Plantillas de Contrato',
  '/contratos': 'Contratos',
  '/boletas': 'Boletas de Pago',
};

export default function Layout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'RRHH Sistema';

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>
            <div className={styles.logoIcon}>R</div>
            <div>
              <div className={styles.logoText}>RRHH Sistema</div>
              <div className={styles.logoSub}>Gestión de Personal</div>
            </div>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map(section => (
            <div key={section.label} className={styles.navSection}>
              <div className={styles.navLabel}>{section.label}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ''}`
                  }
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

      </aside>

      <div className={styles.main}>
        <div className={styles.topbar}>
          <div className={styles.pageTitle}>{title}</div>
        </div>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
