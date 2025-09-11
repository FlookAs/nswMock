import React, { useState } from 'react';
import { Menu, X, Home, FileText, Info, Building, Search } from 'lucide-react';

const Navigation = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Navigation items
    // const navigationItems = [
    //     { id: 'home', label: 'หน้าหลัก', icon: Home, href: '#', active: true },
    //     { id: 'search', label: 'ค้นหาข้อมูล', icon: Search, href: '#', active: false },
    //     { id: 'docs', label: 'เอกสาร', icon: FileText, href: '#', active: false },
    //     { id: 'about', label: 'เกี่ยวกับ', icon: Info, href: '#', active: false },
    // ];

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 w-full">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20 px-4 sm:px-6 lg:px-8">
                    {/* Logo และชื่อระบบ */}
                    <div className="flex items-center space-x-4">
                        {/* ที่สำหรับใส่รูปโลโก้ */}
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
                            {/* ใส่รูปโลโก้ที่นี่ หรือใช้ icon ชั่วคราว */}
                            <img
                                src="images.jpg"
                                alt="NSW Logo"
                                className="w-10 h-10"
                            />
                        </div>

                        <div className="hidden md:block">
                            <h1 className="text-xl font-bold text-gray-900">
                                NSW Mock System
                            </h1>
                            <p className="text-sm text-gray-600">
                                ระบบค้นหาข้อมูลนิติบุคคลกรมศุลกากร
                            </p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    {/* <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navigationItems.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <a
                                        key={item.id}
                                        href={item.href}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${item.active
                                                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </a>
                                );
                            })}
                        </div>
                    </div> */}

                    {/* Environment Badge */}
                    {import.meta.env.VITE_APP_ENV === 'development' ? (
                        <div className="hidden lg:flex items-center space-x-3">
                            <div className="text-right">
                                <div className="text-xs text-gray-500">Environment</div>
                                <div className={`text-xs font-medium px-2 py-1 rounded-full ${import.meta.env.VITE_APP_ENV === 'production'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {import.meta.env.VITE_APP_ENV === 'production' ? 'Production' : 'Development'}
                                </div>
                            </div>
                        </div>
                    ) : null}


                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                            aria-expanded="false"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {/* Mobile Logo Section */}
                        <div className="flex items-center space-x-3 px-3 py-3 border-b border-gray-100 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
                                <Building className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">NSW Mock System</h2>
                                <p className="text-sm text-gray-600">ระบบค้นหาข้อมูลนิติบุคคลกรมศุลกากร</p>
                            </div>
                        </div>

                        {/* Mobile Navigation Items */}
                        {/* {navigationItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <a
                                    key={item.id}
                                    href={item.href}
                                    className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors duration-200 ${item.active
                                            ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <IconComponent className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </a>
                            );
                        })} */}

                        {/* Mobile Environment Info */}
                        <div className="px-3 py-3 border-t border-gray-100 mt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Environment:</span>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${import.meta.env.VITE_APP_ENV === 'production'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {import.meta.env.VITE_APP_ENV === 'production' ? 'Production' : 'Development'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navigation;