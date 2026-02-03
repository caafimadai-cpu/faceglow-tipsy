import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, CheckCircle, ArrowLeft, LogOut, BookOpen, Calendar, Clock, Sparkles, Heart, Eye, ChevronRight, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { format } from 'date-fns';

interface Community {
  id: string;
  name: string;
  description: string;
  member_count: number;
}

interface CommunityPost {
  id: string;
  community_id: string;
  title: string;
  content: string;
  created_at: string;
  category?: string;
  read_time?: number;
  excerpt?: string;
}

interface Membership {
  community_id: string;
  payment_status: string;
}

const CATEGORIES = [
  { id: 'all', name: 'Dhammaan', icon: Sparkles },
  { id: 'skincare', name: 'Daryeelka Maqaarka', icon: Heart },
  { id: 'nutrition', name: 'Nafaqada', icon: Star },
  { id: 'lifestyle', name: 'Nolosha', icon: Eye },
  { id: 'general', name: 'Guud', icon: BookOpen },
];

const Community = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [viewingCommunityId, setViewingCommunityId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchMemberships(session.user.id);
      } else {
        setMemberships([]);
        setPosts([]);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchMemberships(session.user.id);
      }
    });

    fetchCommunities();

    return () => subscription.unsubscribe();
  }, []);

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('member_count', { ascending: false });

      if (error) throw error;
      setCommunities(data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast({
        title: 'Khalad',
        description: 'Wax khalad ah ayaa dhacay marka la soo qaadayo bulshooyinka',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberships = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select('community_id, payment_status')
        .eq('user_id', userId);

      if (error) throw error;
      setMemberships(data || []);
    } catch (error) {
      console.error('Error fetching memberships:', error);
    }
  };

  const fetchPosts = async (communityId: string) => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Khalad',
        description: 'Wax khalad ah ayaa dhacay marka la soo qaadayo maqaallada',
        variant: 'destructive',
      });
    }
  };

  const isMember = (communityId: string) => {
    return memberships.some(
      m => m.community_id === communityId && m.payment_status === 'completed'
    );
  };

  const handleJoinCommunity = async (community: Community) => {
    if (!user) {
      toast({
        title: 'Gal ama Diwaangeli',
        description: 'Waa inaad gashaa si aad ugu biirto bulshada',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setSelectedCommunity(community);
    setShowPaymentDialog(true);
  };

  const handleViewPosts = async (community: Community) => {
    setSelectedCommunity(community);
    setViewingCommunityId(community.id);
    await fetchPosts(community.id);
  };

  const handleBackToCommunities = () => {
    setViewingCommunityId(null);
    setSelectedCommunity(null);
    setPosts([]);
    setActiveCategory('all');
    setSelectedPost(null);
  };

  const handlePayment = async () => {
    if (!phoneNumber) {
      toast({
        title: 'Khalad',
        description: 'Fadlan geli lambarkaa telefoonka',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedCommunity || !user) return;

    setJoiningId(selectedCommunity.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('hormuud-payment', {
        body: {
          communityId: selectedCommunity.id,
          userId: user.id,
          amount: 5,
          phoneNumber: phoneNumber,
        },
      });

      if (error) throw error;

      toast({
        title: 'Guul!',
        description: 'Waad ku guuleysatay inaad ku biirto bulshada. Lacagta waa la diray.',
      });

      setShowPaymentDialog(false);
      setPhoneNumber('');
      fetchCommunities();
      fetchMemberships(user.id);
    } catch (error: any) {
      console.error('Error joining community:', error);
      toast({
        title: 'Khalad',
        description: error.message || 'Wax khalad ah ayaa dhacay marka la bixinayo. Fadlan mar kale isku day.',
        variant: 'destructive',
      });
    } finally {
      setJoiningId(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Guul',
      description: 'Waad ka baxday',
    });
  };

  const filteredPosts = activeCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === activeCategory);

  const getExcerpt = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Hawlka socda...</p>
        </div>
      </div>
    );
  }

  // Blog View - When viewing a community's posts
  if (viewingCommunityId && selectedCommunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button 
                onClick={handleBackToCommunities}
                variant="ghost"
                className="gap-2 hover:bg-primary/10"
              >
                <ArrowLeft className="w-4 h-4" />
                Bulshooyinka
              </Button>
              
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Xubin
                </Badge>
                {user && (
                  <Button 
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
          <div className="container mx-auto px-4 py-12 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-primary/20 text-primary border-none">
                {selectedCommunity.member_count} Xubin
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent font-display">
                {selectedCommunity.name}
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                {selectedCommunity.description}
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="sticky top-[73px] z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveCategory(category.id)}
                    className={`gap-2 whitespace-nowrap transition-all ${
                      activeCategory === category.id 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                        : 'hover:bg-primary/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="container mx-auto px-4 py-8">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-primary/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Weli ma jiraan maqaallo</h3>
              <p className="text-muted-foreground">
                Maqaallada cusub waxay soo bixi doonaan halkan
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
                <Card 
                  key={post.id} 
                  className={`group cursor-pointer overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 ${
                    index === 0 ? 'md:col-span-2 lg:col-span-2' : ''
                  }`}
                  onClick={() => setSelectedPost(post)}
                >
                  {/* Decorative gradient */}
                  <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
                        {CATEGORIES.find(c => c.id === (post.category || 'general'))?.name || 'Guud'}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.read_time || 3} daqiiqo
                      </span>
                    </div>
                    <CardTitle className={`group-hover:text-primary transition-colors ${index === 0 ? 'text-2xl' : 'text-lg'}`}>
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pb-4">
                    <p className={`text-muted-foreground leading-relaxed ${index === 0 ? 'text-base' : 'text-sm'}`}>
                      {post.excerpt || getExcerpt(post.content, index === 0 ? 250 : 120)}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="pt-0 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(post.created_at), 'MMM dd, yyyy')}
                    </span>
                    <span className="text-primary text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Akhri
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Post Detail Modal */}
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0">
            {selectedPost && (
              <>
                {/* Article Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-b from-background via-background to-transparent pb-8 pt-6 px-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary">
                      {CATEGORIES.find(c => c.id === (selectedPost.category || 'general'))?.name || 'Guud'}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedPost.read_time || 3} daqiiqo akhriska
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(selectedPost.created_at), 'MMMM dd, yyyy')}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold font-display leading-tight">
                    {selectedPost.title}
                  </h2>
                </div>
                
                {/* Article Content */}
                <div className="px-6 pb-8">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-base md:text-lg">
                      {selectedPost.content}
                    </p>
                  </div>
                </div>

                {/* Article Footer */}
                <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-8 pb-6 px-6 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">Maqaalka waa la xiisay</span>
                    </div>
                    <Button variant="outline" onClick={() => setSelectedPost(null)}>
                      Xir
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Communities List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Dib u Noqo
          </Button>
          
          {user && (
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Ka Bax
            </Button>
          )}
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent font-display">
            Bulshada Daryeelka Maqaarka
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ku soo biir bulshooyinka daryeelka maqaarka oo la wadaago cilmiga iyo khibradda dadka kale
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => {
            const userIsMember = isMember(community.id);
            
            return (
              <Card key={community.id} className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                {/* Decorative top gradient */}
                <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
                
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      {userIsMember && (
                        <Badge className="bg-primary/20 text-primary border-none">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Xubin
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-muted-foreground">
                        <Users className="w-3 h-3 mr-1" />
                        {community.member_count}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {community.name}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {community.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Maqaallada iyo talooyinka gaar ah</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Khibradaha daryeelka</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Taageero bulshada ah</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {userIsMember ? (
                    <Button
                      className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
                      onClick={() => handleViewPosts(community)}
                    >
                      <BookOpen className="w-4 h-4" />
                      Gal Bulshada
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleJoinCommunity(community)}
                      disabled={joiningId === community.id}
                    >
                      {joiningId === community.id ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                          Bixin...
                        </span>
                      ) : (
                        'Ku Biir Hadda - $5'
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bixin EVC Plus</DialogTitle>
              <DialogDescription>
                Fadlan geli lambarkaa telefoonka EVC Plus si aad u bixiso $5 lacagta ku-biiritaanka
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Lambarka Telefoonka</Label>
                <Input
                  id="phone"
                  placeholder="252xxxxxxxx"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={!!joiningId}
                />
                <p className="text-sm text-muted-foreground">
                  Geli lambarka telefoonka EVC Plus (tusaale: 252615123456)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentDialog(false);
                  setPhoneNumber('');
                }}
                disabled={!!joiningId}
              >
                Ka Noqo
              </Button>
              <Button onClick={handlePayment} disabled={!!joiningId}>
                {joiningId ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
                    Bixin...
                  </>
                ) : (
                  'Bixi $5'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Community;
