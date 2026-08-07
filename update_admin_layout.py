with open('src/components/layout/AdminLayout.tsx', 'r') as f:
    content = f.read()

nav_update = """
    { name: 'Sellers', href: '/admin/sellers', icon: UserCheck },
    { name: 'Buyers', href: '/admin/buyers', icon: Users },
"""
content = content.replace("{ name: 'Seller Verification', href: '/admin/sellers', icon: UserCheck },", nav_update)

nav_update2 = """
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
"""
content = content.replace("{ name: 'Messages', href: '/admin/messages', icon: MessageSquare },", "{ name: 'Messages', href: '/admin/messages', icon: MessageSquare }," + nav_update2)

content = content.replace("import { LayoutDashboard, Users, UserCheck, PackageCheck, Tags, ShoppingCart, MessageSquare, BarChart, Settings, ShieldAlert, LogOut, Sprout } from 'lucide-react';", "import { LayoutDashboard, Users, UserCheck, PackageCheck, Tags, ShoppingCart, MessageSquare, BarChart, Settings, ShieldAlert, LogOut, Sprout, Star, Bell } from 'lucide-react';")

with open('src/components/layout/AdminLayout.tsx', 'w') as f:
    f.write(content)
