import re

with open('src/components/layout/Header.tsx', 'r') as f:
    content = f.read()

new_state = """  const [showCategories, setShowCategories] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get<{ success: boolean; data: any[] }>('/categories');
        if (res.success) {
          setCategories(res.data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchFavorites() {
      if (user && user.role === 'buyer') {
        try {
          const res = await api.get<{ success: boolean; data: any }>('/buyer/stats');
          if (res.success) {
            setFavoritesCount(res.data.favoritesCount || 0);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setFavoritesCount(0);
      }
    }
    fetchFavorites();

    const handleFavoritesUpdate = () => fetchFavorites();
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
  }, [user]);"""

content = re.sub(r'  const \[showCategories, setShowCategories\] = useState\(false\);\s*useEffect\(\(\) => \{.*?\n  \}, \[\]\);', new_state, content, flags=re.DOTALL)


heart_icon = """<Link to="/buyer/saved" className="text-slate-500 hover:text-rose-500 transition-colors relative">
                  <Heart className="h-5 w-5" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                </Link>"""

content = re.sub(r'<Link to="/buyer/saved" className="text-slate-500 hover:text-rose-500 transition-colors">\s*<Heart className="h-5 w-5" />\s*</Link>', heart_icon, content, flags=re.DOTALL)

with open('src/components/layout/Header.tsx', 'w') as f:
    f.write(content)
