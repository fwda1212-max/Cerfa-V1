import React from 'react';
import { Building2, FileText, Settings, Menu, X } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => {
          onChangeView(view);
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 w-full ${
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b px-4 py-3 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
            <span className="font-bold text-gray-800">CerfaFlow</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="text-gray-600" /> : <Menu className="text-gray-600" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-10 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b">
             <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">C</div>
             <span className="font-bold text-xl text-gray-800">CerfaFlow</span>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-2">
            <NavItem view="dashboard" icon={FileText} label="Tableau de bord" />
            <NavItem view="request" icon={FileText} label="Faire une demande" />
            <NavItem view="profile" icon={Building2} label="Mon Entreprise" />
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center text-xs text-gray-400">
                <Settings className="w-4 h-4 mr-2" />
                v1.0.0
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
            {children}
        </div>
      </main>
      
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;