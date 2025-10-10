import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, CheckCircle, ArrowLeft, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';

interface Community {
  id: string;
  name: string;
  description: string;
  member_count: number;
}

const Community = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
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

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) {
      toast({
        title: 'Gal ama Diwaangeli',
        description: 'Waa inaad gashaa si aad ugu biirto bulshada',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setSelectedCommunity(communityId);
    setShowPaymentDialog(true);
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

    setJoiningId(selectedCommunity);
    
    try {
      // Call Hormuud payment API
      const { data, error } = await supabase.functions.invoke('hormuud-payment', {
        body: {
          communityId: selectedCommunity,
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Bulshada Daryeelka Maqaarka
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ku soo biir bulshooyinka daryeelka maqaarka oo la wadaago cilmiga iyo khibradda dadka kale
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <Card key={community.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-primary" />
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {community.member_count}
                  </span>
                </div>
                <CardTitle className="text-xl">{community.name}</CardTitle>
                <CardDescription className="text-base">
                  {community.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Faahfaahin iyo talo gaar ah</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Wadaag khibradaha daryeelka</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Taageero bulshada ah</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleJoinCommunity(community.id)}
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
              </CardFooter>
            </Card>
          ))}
        </div>

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
