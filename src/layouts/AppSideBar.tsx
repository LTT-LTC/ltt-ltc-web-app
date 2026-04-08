"use client";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  Fragment,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/src/@core/provider/sidebar-provider";
import { navItems, AppNavItems } from "@/src/@core/http/routes";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import UserDropdown from "./components/header/UserDropdown";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { t } = useLocalization();
  const pathname = usePathname();

  const renderMenuItems = (
    navItems: AppNavItems[],
    menuType: "main" | "others",
  ) => (
    <>
      {navItems.map((nvI, index) => (
        <Fragment key={`${nvI.categoryName}-${index}`}>
          <h2
            className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
              }`}
          >
            {isExpanded || isHovered || isMobileOpen ? (
              t(`admin.menu.${nvI.categoryName.toLowerCase().replace(/\s+/g, '_')}`) || nvI.categoryName
            ) : (
              // <HorizontaLDots />
              <></>
            )}
          </h2>
          <ul className="flex flex-col gap-4">
            {nvI.navItems.map((nav, index) => (
              <li key={nav.name}>
                {nav.subItems ? (
                  <button
                    onClick={() => handleSubmenuToggle(index, menuType, nvI.categoryName)}
                    className={`menu-item group  ${openSubmenu?.type === menuType &&
                      openSubmenu?.index === index &&
                      openSubmenu?.categoryName === nvI.categoryName
                      ? "menu-item-active"
                      : "menu-item-inactive"
                      } cursor-pointer ${!isExpanded && !isHovered
                        ? "lg:justify-center"
                        : "lg:justify-start"
                      }`}
                  >
                    <span
                      className={` ${openSubmenu?.type === menuType &&
                        openSubmenu?.index === index &&
                        openSubmenu?.categoryName === nvI.categoryName
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                        }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className={`menu-item-text`}>{t(`admin.menu.${nav.name.toLowerCase().replace(/\s+/g, '_')}`) || nav.name}</span>
                    )}
                    {(isExpanded || isHovered || isMobileOpen) && (
                      // <ChevronDownIcon
                      //   className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                      //     openSubmenu?.type === menuType &&
                      //     openSubmenu?.index === index &&
                      //     openSubmenu?.categoryName === nvI.categoryName
                      //       ? "rotate-180 text-brand-500"
                      //       : ""
                      //   }`}
                      // />
                      <></>
                    )}
                  </button>
                ) : (
                  nav.path && (
                    <Link
                      href={nav.path}
                      className={`menu-item group ${isActive(nav.path)
                        ? "menu-item-active"
                        : "menu-item-inactive"
                        }`}
                    >
                      <span
                        className={`${isActive(nav.path)
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                          }`}
                      >
                        {nav.icon}
                      </span>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <span className={`menu-item-text`}>{t(`admin.menu.${nav.name.toLowerCase().replace(/\s+/g, '_')}`) || nav.name}</span>
                      )}
                    </Link>
                  )
                )}
                {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                  <div
                    ref={(el) => {
                      subMenuRefs.current[`${menuType}-${index}-${nvI.categoryName}`] = el;
                    }}
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      height:
                        openSubmenu?.type === menuType &&
                          openSubmenu?.index === index &&
                          openSubmenu?.categoryName === nvI.categoryName
                          ? `${subMenuHeight[`${menuType}-${index}-${nvI.categoryName}`]}px`
                          : "0px",
                    }}
                  >
                    <ul className="mt-2 space-y-1 ml-9">
                      {nav.subItems.map((subItem) => (
                        <li key={subItem.name}>
                          <Link
                            href={subItem.path}
                            className={`menu-dropdown-item ${isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                              }`}
                          >
                            {t(`admin.menu.${subItem.name.toLowerCase().replace(/\s+/g, '_')}`) || subItem.name}
                            <span className="flex items-center gap-1 ml-auto">
                              {subItem.new && (
                                <span
                                  className={`ml-auto ${isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                    } menu-dropdown-badge `}
                                >
                                  new
                                </span>
                              )}
                              {subItem.pro && (
                                <span
                                  className={`ml-auto ${isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                    } menu-dropdown-badge `}
                                >
                                  pro
                                </span>
                              )}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Fragment>
      ))}
    </>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
    categoryName: string;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : [];
      items.forEach((navI, index) => {
        if (navI.navItems) {
          navI.navItems.forEach((navItem, index) => {
            if (navItem.subItems) {
              navItem.subItems.forEach((subItem) => {
                if (isActive(subItem.path)) {
                  setOpenSubmenu({
                    type: menuType as "main" | "others",
                    index,
                    categoryName: navI.categoryName,
                  });
                  submenuMatched = true;
                }
              });
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}-${openSubmenu.categoryName}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others", categoryName: string) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index &&
        prevOpenSubmenu.categoryName === categoryName
      ) {
        return null;
      }
      return { type: menuType, index, categoryName };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-1 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/main/app-logo.png"
                alt="Logo"
                width={132}
                height={20}
              />
              <Image
                className="hidden dark:block"
                src="/images/main/app-logo.png"
                alt="Logo"
                width={132}
                height={20}
              />
            </>
          ) : (
            <Image
              src="/images/main/app-logo.png"
              alt="Logo"
              width={132}
              height={20}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto duration-300 ease-linear no-scrollbar">
        {(isExpanded || isHovered || isMobileOpen) && (
          <div className="flex px-4 py-4 mb-4 border-b border-gray-200 dark:border-gray-800 lg:hidden">
            <UserDropdown />
          </div>
        )}
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>{renderMenuItems(navItems, "main")}</div>
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
